import { Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TBulkSearchReplaceSchema, type TMatchField } from './query.search.schema'

/** Same normalization as the existing name/description search paths - strip accents/punctuation, lowercase. */
const normalize = (fragment: Prisma.Sql) =>
	Prisma.sql`lower(public.immutable_unaccent(regexp_replace(${fragment}, '[^a-zA-Z0-9 ]', '', 'g')))`

/**
 * Narrow to services carrying ANY of the selected ids - an indexed array-overlap check against the same
 * materialized `attributeIds`/`tagIds` columns the scope-checkbox match clauses already use. `TRUE` when
 * unset, so it never narrows anything by default.
 */
const serviceTagCondition = (ids: string[] | undefined): Prisma.Sql =>
	ids && ids.length > 0 ? Prisma.sql`os."tagIds" && ${ids}::text[]` : Prisma.sql`TRUE`
const serviceAttributeCondition = (ids: string[] | undefined): Prisma.Sql =>
	ids && ids.length > 0 ? Prisma.sql`os."attributeIds" && ${ids}::text[]` : Prisma.sql`TRUE`

interface OrgIdRow {
	id: string
	total: bigint
	matchedOrgName: boolean
	matchedOrgDescription: boolean
}

interface ServiceMatchRow {
	id: string
	organizationId: string
	matchedServiceName: boolean
	matchedServiceDescription: boolean
	matchedServiceAttributes: boolean
	matchedServiceTags: boolean
}

/**
 * Finds the paginated set of organization IDs that match, either directly (name/description) or via at least
 * one of their services (name/description/attributes/tags). Raw SQL because the service-level clause is an
 * EXISTS subquery Prisma's query builder can't express, and because trigram-adjacent ILIKE matching against
 * joined FreeText/TranslationKey content isn't otherwise reachable through it either.
 */
const searchOrgIds = async (
	input: TBulkSearchReplaceSchema
): Promise<{ ids: string[]; total: number; orgMatches: Map<string, TMatchField[]> }> => {
	const term = `%${input.search.replace(/[^a-zA-Z0-9 ]/g, '')}%`
	const { scope } = input
	// Organization-level only - `undefined` means both deleted/non-deleted show, matching
	// organization.forOrganizationTable's exact tri-state convention. Service-level deleted stays
	// unconditional (hardcoded `false`) below, untouched by this param.
	const deletedCondition =
		input.deleted !== undefined ? Prisma.sql`o.deleted = ${input.deleted}` : Prisma.sql`TRUE`
	const tagCondition = serviceTagCondition(input.serviceTagIds)
	const attributeCondition = serviceAttributeCondition(input.serviceAttributeIds)
	// When either service-level filter is active, an org's own name/description match no longer
	// qualifies it on its own - the filter is fundamentally about services, so only a qualifying
	// service (one that also satisfies it, below) can bring the org into the results.
	const hasServiceFilter = Boolean(input.serviceTagIds?.length || input.serviceAttributeIds?.length)
	const orgDirectMatchGate = hasServiceFilter ? Prisma.sql`FALSE` : Prisma.sql`TRUE`

	const rows = await prisma.$queryRaw<OrgIdRow[]>`
		SELECT
			o.id,
			count(*) OVER() as total,
			(${scope.orgName} AND ${normalize(Prisma.sql`o.name`)} ILIKE ${term}) as "matchedOrgName",
			(${scope.orgDescription} AND odtk.text IS NOT NULL AND ${normalize(Prisma.sql`odtk.text`)} ILIKE ${term}) as "matchedOrgDescription"
		FROM "Organization" o
		LEFT JOIN "FreeText" odf ON odf.id = o."descriptionId"
		LEFT JOIN "TranslationKey" odtk ON odtk.key = odf.key AND odtk.ns = odf.ns
		WHERE ${deletedCondition} AND (
			(${orgDirectMatchGate} AND (
				(${scope.orgName} AND ${normalize(Prisma.sql`o.name`)} ILIKE ${term})
				OR (${scope.orgDescription} AND odtk.text IS NOT NULL AND ${normalize(Prisma.sql`odtk.text`)} ILIKE ${term})
			))
			OR EXISTS (
				SELECT 1 FROM "OrgService" os
				LEFT JOIN "FreeText" snf ON snf.id = os."serviceNameId"
				LEFT JOIN "TranslationKey" sntk ON sntk.key = snf.key AND sntk.ns = snf.ns
				LEFT JOIN "FreeText" sdf ON sdf.id = os."descriptionId"
				LEFT JOIN "TranslationKey" sdtk ON sdtk.key = sdf.key AND sdtk.ns = sdf.ns
				WHERE os."organizationId" = o.id AND os.deleted = false
					AND ${tagCondition} AND ${attributeCondition} AND (
					(${scope.serviceName} AND sntk.text IS NOT NULL AND ${normalize(Prisma.sql`sntk.text`)} ILIKE ${term})
					OR (${scope.serviceDescription} AND sdtk.text IS NOT NULL AND ${normalize(Prisma.sql`sdtk.text`)} ILIKE ${term})
					OR (${scope.serviceAttributes} AND EXISTS (
						SELECT 1 FROM "Attribute" a WHERE a.id = ANY(os."attributeIds") AND ${normalize(Prisma.sql`a.name`)} ILIKE ${term}
					))
					OR (${scope.serviceTags} AND EXISTS (
						SELECT 1 FROM "ServiceTag" st WHERE st.id = ANY(os."tagIds") AND ${normalize(Prisma.sql`st.name`)} ILIKE ${term}
					))
				)
			)
		)
		ORDER BY o.name ASC, o.id ASC
		LIMIT ${input.take}
		OFFSET ${input.skip}
	`

	const orgMatches = new Map<string, TMatchField[]>()
	rows.forEach((row) => {
		const matches: TMatchField[] = []
		if (row.matchedOrgName) matches.push('orgName')
		if (row.matchedOrgDescription) matches.push('orgDescription')
		orgMatches.set(row.id, matches)
	})

	return { ids: rows.map((row) => row.id), total: Number(rows[0]?.total ?? 0), orgMatches }
}

/**
 * For the already-paginated set of matched org IDs, finds which specific services matched and why - only
 * these render as sub-rows, not every service under a matched org.
 */
const searchServiceMatches = async (
	orgIds: string[],
	input: TBulkSearchReplaceSchema
): Promise<Map<string, TMatchField[]>> => {
	if (orgIds.length === 0) return new Map()
	const term = `%${input.search.replace(/[^a-zA-Z0-9 ]/g, '')}%`
	const { scope } = input
	const tagCondition = serviceTagCondition(input.serviceTagIds)
	const attributeCondition = serviceAttributeCondition(input.serviceAttributeIds)

	const rows = await prisma.$queryRaw<ServiceMatchRow[]>`
		SELECT
			os.id,
			os."organizationId",
			(${scope.serviceName} AND sntk.text IS NOT NULL AND ${normalize(Prisma.sql`sntk.text`)} ILIKE ${term}) as "matchedServiceName",
			(${scope.serviceDescription} AND sdtk.text IS NOT NULL AND ${normalize(Prisma.sql`sdtk.text`)} ILIKE ${term}) as "matchedServiceDescription",
			(${scope.serviceAttributes} AND EXISTS (
				SELECT 1 FROM "Attribute" a WHERE a.id = ANY(os."attributeIds") AND ${normalize(Prisma.sql`a.name`)} ILIKE ${term}
			)) as "matchedServiceAttributes",
			(${scope.serviceTags} AND EXISTS (
				SELECT 1 FROM "ServiceTag" st WHERE st.id = ANY(os."tagIds") AND ${normalize(Prisma.sql`st.name`)} ILIKE ${term}
			)) as "matchedServiceTags"
		FROM "OrgService" os
		LEFT JOIN "FreeText" snf ON snf.id = os."serviceNameId"
		LEFT JOIN "TranslationKey" sntk ON sntk.key = snf.key AND sntk.ns = snf.ns
		LEFT JOIN "FreeText" sdf ON sdf.id = os."descriptionId"
		LEFT JOIN "TranslationKey" sdtk ON sdtk.key = sdf.key AND sdtk.ns = sdf.ns
		WHERE os."organizationId" = ANY(${orgIds}) AND os.deleted = false
			AND ${tagCondition} AND ${attributeCondition}
			AND (
				(${scope.serviceName} AND sntk.text IS NOT NULL AND ${normalize(Prisma.sql`sntk.text`)} ILIKE ${term})
				OR (${scope.serviceDescription} AND sdtk.text IS NOT NULL AND ${normalize(Prisma.sql`sdtk.text`)} ILIKE ${term})
				OR (${scope.serviceAttributes} AND EXISTS (
					SELECT 1 FROM "Attribute" a WHERE a.id = ANY(os."attributeIds") AND ${normalize(Prisma.sql`a.name`)} ILIKE ${term}
				))
				OR (${scope.serviceTags} AND EXISTS (
					SELECT 1 FROM "ServiceTag" st WHERE st.id = ANY(os."tagIds") AND ${normalize(Prisma.sql`st.name`)} ILIKE ${term}
				))
			)
	`

	const serviceMatches = new Map<string, TMatchField[]>()
	rows.forEach((row) => {
		const matches: TMatchField[] = []
		if (row.matchedServiceName) matches.push('serviceName')
		if (row.matchedServiceDescription) matches.push('serviceDescription')
		if (row.matchedServiceAttributes) matches.push('serviceAttributes')
		if (row.matchedServiceTags) matches.push('serviceTags')
		serviceMatches.set(row.id, matches)
	})
	return serviceMatches
}

const ORG_SELECT = {
	id: true,
	name: true,
	slug: true,
	lastVerified: true,
	deleted: true,
	published: true,
	unpublishedReason: true,
	createdAt: true,
	updatedAt: true,
	description: { select: { tsKey: { select: { text: true } } } },
} satisfies Prisma.OrganizationSelect

const SERVICE_SELECT = {
	id: true,
	organizationId: true,
	updatedAt: true,
	createdAt: true,
	deleted: true,
	published: true,
	attributeIds: true,
	tagIds: true,
	serviceName: { select: { tsKey: { select: { text: true } } } },
	description: { select: { tsKey: { select: { text: true } } } },
	// One active link is enough to pick a deep-edit target - a service linked to more than one location
	// deep-links to only the first found, a documented simplification, not a data gap.
	locations: { where: { active: true }, take: 1, select: { orgLocationId: true } },
} satisfies Prisma.OrgServiceSelect

const search = async ({ input }: TRPCHandlerParams<TBulkSearchReplaceSchema, 'protected'>) => {
	const { ids: orgIds, total, orgMatches } = await searchOrgIds(input)
	if (orgIds.length === 0) {
		return { results: [], total: 0 }
	}

	const [orgs, services, serviceMatches] = await Promise.all([
		prisma.organization.findMany({ where: { id: { in: orgIds } }, select: ORG_SELECT }),
		prisma.orgService.findMany({
			where: { organizationId: { in: orgIds } },
			select: SERVICE_SELECT,
		}),
		searchServiceMatches(orgIds, input),
	])

	const orgById = new Map(orgs.map((org) => [org.id, org]))
	const servicesByOrg = new Map<string, typeof services>()
	services.forEach((svc) => {
		if (!svc.organizationId || !serviceMatches.has(svc.id)) return
		const list = servicesByOrg.get(svc.organizationId) ?? []
		list.push(svc)
		servicesByOrg.set(svc.organizationId, list)
	})

	const results = orgIds.flatMap((id) => {
		const org = orgById.get(id)
		if (!org) return []
		const matchedServices = (servicesByOrg.get(id) ?? []).map((svc) => ({
			id: svc.id,
			name: svc.serviceName?.tsKey.text ?? '',
			description: svc.description?.tsKey.text ?? null,
			updatedAt: svc.updatedAt,
			createdAt: svc.createdAt,
			deleted: svc.deleted,
			published: svc.published,
			attributeIds: svc.attributeIds,
			tagIds: svc.tagIds,
			orgLocationId: svc.locations[0]?.orgLocationId ?? null,
			matches: serviceMatches.get(svc.id) ?? [],
		}))
		return [
			{
				id: org.id,
				name: org.name,
				slug: org.slug,
				description: org.description?.tsKey.text ?? null,
				lastVerified: org.lastVerified,
				updatedAt: org.updatedAt,
				createdAt: org.createdAt,
				deleted: org.deleted,
				published: org.published,
				unpublishedReason: org.unpublishedReason,
				matches: orgMatches.get(org.id) ?? [],
				services: matchedServices,
			},
		]
	})

	return { results, total }
}

export default search
