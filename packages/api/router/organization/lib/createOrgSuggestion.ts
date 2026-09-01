import { TRPCError } from '@trpc/server'

import { addSingleKeyFromNestedFreetextCreate, buildContextUrl } from '@weareinreach/crowdin/api'
import { generateId, generateNestedFreeText, generateUniqueSlug, getAuditedClient } from '@weareinreach/db'
import { type SourceType } from '@weareinreach/db/enums'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateNewSuggestionSchema } from '../mutation.createNewSuggestion.schema'

// Reduces a URL to its bare domain - strips protocol, "www.", and everything from the first /, ?, or #
// onward - so "https://www.example.org/donate" and "example.org" are treated as the same organization.
const normalizeToDomain = (url: string) =>
	url
		.trim()
		.toLowerCase()
		.replace(/^https?:\/\//, '')
		.replace(/^www\./, '')
		.split(/[/?#]/)[0] ?? ''

const DATA_PORTAL_PERMISSIONS = [
	'dataPortalBasic',
	'dataPortalManager',
	'dataPortalAdmin',
	'root',
	'sysadmin',
	'system',
]

// Mirrors packages/auth/lib/genUserSession.ts's exact permission derivation (both the role-derived path
// and the direct-grant path, no authorized/active filtering) - that's what actually gates real Data
// Portal login access, so it's the correct definition of "did this person have access" for snapshotting
// at creation time. Not imported directly from packages/auth since that function is keyed by email and
// builds a full NextAuth session object; this only needs a boolean for a known userId.
const hasDataPortalAccess = async (
	prisma: ReturnType<typeof getAuditedClient>,
	userId: string
): Promise<boolean> => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			roles: {
				select: { role: { select: { permissions: { select: { permission: { select: { name: true } } } } } } },
			},
			permissions: { select: { permission: { select: { name: true } } } },
		},
	})
	if (!user) return false
	const permissionNames = new Set([
		...user.roles.flatMap(({ role }) => role.permissions.map(({ permission }) => permission.name)),
		...user.permissions.map(({ permission }) => permission.name),
	])
	return DATA_PORTAL_PERMISSIONS.some((p) => permissionNames.has(p))
}

interface CreateOrgSuggestionParams extends TRPCHandlerParams<TCreateNewSuggestionSchema, 'protected'> {
	/** The `Source.source` value to tag the created org with (e.g. 'suggestion', 'data-portal'). */
	sourceValue: string
	/** The `Source.type` to use if `sourceValue` doesn't exist yet and needs to be created. */
	sourceType: SourceType
	/** Data Portal only - the public suggestion schema/form doesn't collect this. */
	description?: string
}

/**
 * Shared creation logic behind both the public "Suggest an Organization" form and the Data Portal's "Add an
 * organization" modal - same fields, same duplicate check, same resulting Organization + Suggestion records.
 * Only `sourceValue`/`sourceType` differ between the two callers, so origin (public vs. staff) stays
 * distinguishable via `Organization.source` without duplicating this transaction twice.
 */
export const createOrgSuggestion = async ({
	ctx,
	input,
	sourceValue,
	sourceType,
	description,
}: CreateOrgSuggestionParams) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { countryId, orgName, orgSlug, communityFocus, orgAddress, orgWebsite, existingOrgId } = input

	if (!existingOrgId) {
		// Normalize down to the bare domain, the same way query.getPotentialMatches does, so
		// "already flagged while typing" and "blocked on submit" agree on what counts as a duplicate.
		// A broad substring pre-filter narrows the candidates cheaply, then the exact domain comparison
		// happens in JS - this avoids hand-rolling regex/backreference logic in raw SQL.
		const normalizedWebsite = normalizeToDomain(orgWebsite)
		const candidates = await prisma.orgWebsite.findMany({
			where: { url: { contains: normalizedWebsite, mode: 'insensitive' } },
			select: { url: true },
		})
		const isDuplicate = candidates.some((candidate) => normalizeToDomain(candidate.url) === normalizedWebsite)
		if (isDuplicate) {
			throw new TRPCError({
				code: 'CONFLICT',
				message: 'This website is already associated with an existing organization in our system.',
			})
		}
	}

	const organizationId = existingOrgId ?? generateId('organization')

	// Re-verify the slug freshly against the DB rather than trusting the client-supplied `orgSlug` -
	// that value comes from a cached tRPC query on the client (`organization.generateSlug`), which can go
	// stale within a single session: e.g. the same org name gets typed again shortly after it was already
	// used to successfully create an org, the client still has the old (now-taken) slug cached, and
	// `tx.organization.create` below would fail on the `slug` unique constraint. `generateUniqueSlug`
	// always checks fresh and falls back to an id-suffixed slug if the name-based one is taken.
	const finalOrgSlug = existingOrgId
		? undefined
		: await generateUniqueSlug({ name: orgName, id: organizationId })

	// Snapshotted once, at creation time, not recomputed on later reads - a submitter's access can change
	// after the fact (interns/volunteers rotate in and out), and "did they have access when they actually
	// submitted this" is the correct question for distinguishing a real public suggestion from staff/an
	// intern using the public form because the Data Portal's own Add Org modal didn't exist yet.
	const creatorHadDpAccess = existingOrgId ? undefined : await hasDataPortalAccess(prisma, ctx.actorId)

	// Crowdin sync (a network call to a third party) must happen outside the DB transaction below - Prisma
	// interactive transactions have a ~5s timeout, and holding one open across an external API call risks
	// "Transaction already closed" once Crowdin is slow to respond. Same constraint createNewQuick's
	// handler documents. Only relevant for a genuinely new org - attaching a description to an existing
	// one isn't something either caller of this function does today.
	let descriptionCreate: ReturnType<typeof generateNestedFreeText> | undefined
	if (!existingOrgId && description && finalOrgSlug) {
		descriptionCreate = generateNestedFreeText({ orgId: organizationId, type: 'orgDesc', text: description })
		const { id: crowdinId } = await addSingleKeyFromNestedFreetextCreate(
			descriptionCreate,
			buildContextUrl(finalOrgSlug)
		)
		descriptionCreate.create.tsKey.create.crowdinId = crowdinId
	}

	// Use a transaction to ensure all database operations are atomic.
	// If any operation fails, the entire transaction is rolled back.
	const result = await prisma.$transaction(async (tx) => {
		if (!existingOrgId) {
			// 1. Create the new Organization record first. `connectOrCreate` lazily creates the Source row
			// the first time a given sourceValue is used, so no migration/seed step is needed anywhere.
			await tx.organization.create({
				data: {
					id: organizationId,
					name: orgName,
					slug: finalOrgSlug ?? orgSlug,
					source: {
						connectOrCreate: {
							where: { source: sourceValue },
							create: { source: sourceValue, type: sourceType },
						},
					},
					creatorHadDpAccess,
					...(descriptionCreate && { description: descriptionCreate }),
				},
			})
		}

		// 2. Create the Suggestion record.
		await tx.suggestion.create({
			data: {
				organizationId: organizationId,
				suggestedById: ctx.actorId,
				data: input,
			},
		})

		// 3. Create placeholder data for other related tables.
		const createOperations = []

		// A. Add the OrgWebsite record if a website URL was provided.
		if (orgWebsite) {
			createOperations.push(
				tx.orgWebsite.create({
					data: {
						organizationId: organizationId,
						url: orgWebsite,
					},
				})
			)
		}

		// B. Create the OrgLocation record if an address was provided.
		if (orgAddress && Object.keys(orgAddress).length > 0) {
			const cleanedStreet1 = orgAddress.street1?.replace('undefined', '').trim()

			// Find the ID for the government district based on either the full name or the abbreviation.
			const govDist = await tx.govDist.findFirst({
				where: {
					OR: [{ name: orgAddress.govDist ?? undefined }, { abbrev: orgAddress.govDist ?? undefined }],
				},
				select: { id: true, abbrev: true },
			})

			// "City, ST" (e.g. "Chicago, IL") rather than the org's own name - a location named after its
			// own org reads oddly once a second location exists, and goes stale if the org gets renamed
			// later. Falls back to the org name only if no city was actually provided.
			const locationName = orgAddress.city
				? [orgAddress.city, govDist?.abbrev].filter(Boolean).join(', ')
				: orgName

			createOperations.push(
				tx.orgLocation.create({
					data: {
						orgId: organizationId,
						name: locationName,
						// This is the org's only location at creation time (this branch only runs for a
						// brand-new org today - existingOrgId has no live caller), so it should always be
						// the primary one. Without this, code elsewhere that looks up an org's location via
						// `where: { primary: true }` (e.g. query.getPotentialMatches, for the duplicate-check
						// dropdown's city/state display) finds nothing and falls back to showing "Remote"
						// even though a real address was provided.
						primary: true,
						street1: cleanedStreet1,
						city: orgAddress.city ?? '',
						postCode: orgAddress.postCode,
						govDistId: govDist?.id,
						countryId: countryId,
					},
				})
			)
		}

		// C. Add AttributeSupplement records for each selected community.
		if (communityFocus && communityFocus.length > 0) {
			const communityCreates = communityFocus.map((attributeId) =>
				tx.attributeSupplement.create({
					data: {
						organizationId: organizationId,
						attributeId: attributeId,
					},
				})
			)
			createOperations.push(...communityCreates)
		}

		// D. Execute all other create operations in parallel for efficiency.
		await Promise.all(createOperations)

		// Return the actual persisted slug, not the client-supplied one - the two can differ (see the
		// `finalOrgSlug` note above), and callers that navigate to the org's edit page need the real one.
		return { id: organizationId, slug: finalOrgSlug ?? orgSlug }
	})
	return result
}
