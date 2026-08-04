import { TRPCError } from '@trpc/server'

import { generateId, getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateNewSuggestionSchema } from './mutation.createNewSuggestion.schema'

// Reduces a URL to its bare domain - strips protocol, "www.", and everything from the first /, ?, or #
// onward - so "https://www.example.org/donate" and "example.org" are treated as the same organization.
const normalizeToDomain = (url: string) =>
	url
		.trim()
		.toLowerCase()
		.replace(/^https?:\/\//, '')
		.replace(/^www\./, '')
		.split(/[/?#]/)[0] ?? ''

const createNewSuggestion = async ({
	ctx,
	input,
}: TRPCHandlerParams<TCreateNewSuggestionSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { countryId, orgName, orgSlug, communityFocus, orgAddress, orgWebsite, existingOrgId } = input

	// Use a transaction to ensure all database operations are atomic.
	// If any operation fails, the entire transaction is rolled back.
	const result = await prisma.$transaction(async (tx) => {
		console.log('Starting transaction for organization suggestion.')

		if (!existingOrgId) {
			// Normalize down to the bare domain, the same way query.getPotentialMatches does, so
			// "already flagged while typing" and "blocked on submit" agree on what counts as a duplicate.
			// A broad substring pre-filter narrows the candidates cheaply, then the exact domain
			// comparison happens in JS - this avoids hand-rolling regex/backreference logic in raw SQL.
			const normalizedWebsite = normalizeToDomain(orgWebsite)
			const candidates = await tx.orgWebsite.findMany({
				where: { url: { contains: normalizedWebsite, mode: 'insensitive' } },
				select: { url: true },
			})
			const isDuplicate = candidates.some(
				(candidate) => normalizeToDomain(candidate.url) === normalizedWebsite
			)
			if (isDuplicate) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'This website is already associated with an existing organization in our system.',
				})
			}
		}

		let organizationId = existingOrgId

		if (!organizationId) {
			console.log('Creating a new organization record.')
			// 1. Create the new Organization record first.
			const newOrganization = await tx.organization.create({
				data: {
					id: generateId('organization'),
					name: orgName,
					slug: orgSlug,
					source: { connect: { source: 'suggestion' } },
				},
			})
			organizationId = newOrganization.id
		}

		console.log('Organization created with ID:', organizationId)

		// 2. Create the Suggestion record.
		await tx.suggestion.create({
			data: {
				organizationId: organizationId,
				suggestedById: ctx.actorId,
				data: input,
			},
		})
		console.log('Suggestion record created.')

		// 3. Create placeholder data for other related tables.
		const createOperations = []

		// A. Add the OrgWebsite record if a website URL was provided.
		if (orgWebsite) {
			console.log('Adding OrgWebsite creation to the queue.')
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
		let newOrgLocation = null
		if (orgAddress && Object.keys(orgAddress).length > 0) {
			console.log('Creating OrgLocation record...')
			const cleanedStreet1 = orgAddress.street1?.replace('undefined', '').trim()

			// Find the ID for the government district based on either the full name or the abbreviation.
			const govDist = await tx.govDist.findFirst({
				where: {
					OR: [{ name: orgAddress.govDist ?? undefined }, { abbrev: orgAddress.govDist ?? undefined }],
				},
				select: { id: true },
			})

			newOrgLocation = await tx.orgLocation.create({
				data: {
					orgId: organizationId,
					name: orgName,
					street1: cleanedStreet1,
					city: orgAddress.city ?? '',
					postCode: orgAddress.postCode,
					govDistId: govDist?.id,
					countryId: countryId,
				},
			})
			console.log('OrgLocation created with ID:', newOrgLocation.id)
		}

		// D. Add AttributeSupplement records for each selected community.
		if (communityFocus && communityFocus.length > 0) {
			console.log('Adding AttributeSupplement records to the queue.')
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

		// E. Execute all other create operations in parallel for efficiency.
		console.log('Awaiting all creation operations to complete...')
		await Promise.all(createOperations)
		console.log('All creation operations completed successfully.')

		// Return the newly created organization's ID.
		return { id: organizationId }
	})
	console.log('Transaction finalized successfully.')
	return result
}
export default createNewSuggestion
