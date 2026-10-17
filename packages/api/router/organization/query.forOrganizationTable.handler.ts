import compact from 'just-compact'

import { Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import {
	STATUS_FILTER_TO_REASON,
	type TForOrganizationTableSchema,
	type TRemoteOption,
} from './query.forOrganizationTable.schema'

type MatchMode = TForOrganizationTableSchema['communityMatchMode']

/**
 * Org ids whose `attributeIds` (materialized, GIN-indexed) match the given attribute ids - 'any' (default)
 * means at least one; 'all' means every one simultaneously. Shared by Community Focus and Leader Badge, which
 * are both just Organization-level Attribute ids under a different AttributeCategory (see
 * organization.badgeOptions) - kept as two independent calls rather than one merged filter so picking a value
 * from each narrows together instead of being treated as the same facet.
 */
const orgIdsByAttributes = async (attributeIds: string[], matchMode: MatchMode): Promise<string[]> => {
	const rows = await prisma.organization.findMany({
		where: { attributeIds: matchMode === 'all' ? { hasEvery: attributeIds } : { hasSome: attributeIds } },
		select: { id: true },
	})
	return rows.map((row) => row.id)
}

// See ZRemoteOption's comment - a service's only link to a location is the OrgLocationService join table,
// which can have zero rows.
const REMOTE_SERVICE_WHERE: Record<
	NonNullable<TForOrganizationTableSchema['remoteOptions']>[number],
	Prisma.OrgServiceWhereInput
> = {
	'remote-no-location': { locations: { none: {} } },
	'remote-with-location': {
		locations: { some: {} },
		attributes: { some: { attribute: { tag: 'offers-remote-services' } } },
	},
	'in-person-only': {
		locations: { some: {} },
		attributes: { none: { attribute: { tag: 'offers-remote-services' } } },
	},
}

/**
 * Service Tags, Service Attributes, and Remote Options all describe facets of a _service_, not the org
 * directly - each active facet becomes its own condition inside one `services.some(...)`, so the SAME service
 * must satisfy all of them together (e.g. "Remote Options: no location" + "Service Tags: Mental Health" only
 * matches an org whose remote service is itself tagged Mental Health, not an org that merely has some remote
 * service and some unrelated Mental Health service elsewhere). Returns `undefined` when no service-level
 * facet is active, so the caller can skip the query entirely.
 *
 * `OrgService.services` (confusingly named - it's the service's own tags, via `OrgServiceTag`, not a services
 * list) and `OrgService.attributes` (via `AttributeSupplement`) are matched by relation id
 * (`tagId`/`attributeId`) rather than the materialized `Organization.serviceIds`/`attributeIds` arrays, since
 * those are flattened across every service on the org and would lose exactly the per-service grouping this
 * needs.
 */
const buildServiceGroupWhere = (
	input: TForOrganizationTableSchema
): Prisma.OrganizationWhereInput | undefined => {
	const serviceAnd: Prisma.OrgServiceWhereInput[] = []
	if (input.serviceTagIds?.length) {
		if (input.serviceTagMatchMode === 'all') {
			serviceAnd.push(...input.serviceTagIds.map((tagId) => ({ services: { some: { tagId } } })))
		} else {
			serviceAnd.push({ services: { some: { tagId: { in: input.serviceTagIds } } } })
		}
	}
	if (input.serviceAttributeIds?.length) {
		if (input.serviceAttributeMatchMode === 'all') {
			serviceAnd.push(
				...input.serviceAttributeIds.map((attributeId) => ({ attributes: { some: { attributeId } } }))
			)
		} else {
			serviceAnd.push({ attributes: { some: { attributeId: { in: input.serviceAttributeIds } } } })
		}
	}
	if (input.remoteOptions?.length) {
		serviceAnd.push({ OR: input.remoteOptions.map((option) => REMOTE_SERVICE_WHERE[option]) })
	}
	if (!serviceAnd.length) {
		return undefined
	}
	return { services: { some: { deleted: false, AND: serviceAnd } } }
}

const serviceGroupOrgIds = async (input: TForOrganizationTableSchema): Promise<string[] | undefined> => {
	const where = buildServiceGroupWhere(input)
	if (!where) {
		return undefined
	}
	const rows = await prisma.organization.findMany({ where, select: { id: true } })
	return rows.map((row) => row.id)
}

// 'public' = suggested AND the submitter had no Data Portal access. 'internal' unions the other two real
// origins (suggested by someone WITH access, or added directly via the Data Portal) - both mean "not
// actually the public," regardless of which of the two forms was used.
const createMethodWhere = (
	createMethod: TForOrganizationTableSchema['createMethod']
): Prisma.OrganizationWhereInput | undefined => {
	switch (createMethod) {
		case 'public':
			return { source: { source: 'suggestion' }, creatorHadDpAccess: false }
		case 'internal':
			return {
				OR: [
					{ source: { source: 'suggestion' }, creatorHadDpAccess: true },
					{ source: { source: 'data-portal' } },
				],
			}
		default:
			return undefined
	}
}

// Supersedes a plain `published` boolean filter - 'published' means `published: true`; every other
// value means `published: false` AND that specific `unpublishedReason`. Multi-select: several chosen
// values union (OR) - this filters which orgs show up, it never sets more than one status on an org.
const statusWhere = (
	status: TForOrganizationTableSchema['status']
): Prisma.OrganizationWhereInput | undefined => {
	if (!status || status.length === 0) {
		return undefined
	}
	return {
		OR: status.map((s) =>
			s === 'published'
				? { published: true }
				: { published: false, unpublishedReason: STATUS_FILTER_TO_REASON[s] }
		),
	}
}

const LOCATIONS_SELECT = {
	id: true,
	name: true,
	updatedAt: true,
	createdAt: true,
	published: true,
	deleted: true,
} satisfies Prisma.OrgLocationSelect

const ORG_SELECT = {
	id: true,
	name: true,
	slug: true,
	lastVerified: true,
	updatedAt: true,
	createdAt: true,
	published: true,
	deleted: true,
	locations: { select: LOCATIONS_SELECT },
	source: { select: { source: true } },
	creatorHadDpAccess: true,
	unpublishedReason: true,
	// The org's earliest Suggestion is the one that created it - see creatorOrgIds's comment. A later
	// Suggestion always targets an already-existing org, so this never picks up an unrelated edit
	// suggestion instead of the actual creator.
	suggestions: {
		orderBy: { createdAt: 'asc' },
		take: 1,
		select: { suggestedBy: { select: { id: true, name: true, email: true } } },
	},
	// Materialized org-level ids, for the Community/Leader Badge/Service Tags table columns - the client
	// already has id->name lookups for these from the toolbar's own quick filters (badgeOptions,
	// component.ServiceSelect), so no join is needed here.
	attributeIds: true,
	serviceIds: true,
	// Service Attributes and Remote Options both describe individual services, not the org directly - this
	// raw per-service data only exists to be collapsed into flat per-org summaries by withServiceSummaries
	// below, and never reaches the client as-is. Matches REMOTE_SERVICE_WHERE's own criteria exactly (a
	// service's remote status depends on both its location count and the 'offers-remote-services' attribute).
	services: {
		where: { deleted: false },
		select: {
			attributeIds: true,
			_count: { select: { locations: true } },
			attributes: { where: { attribute: { tag: 'offers-remote-services' } }, select: { id: true } },
		},
	},
} satisfies Prisma.OrganizationSelect

type ServiceSummaryRow = {
	attributeIds: string[]
	_count: { locations: number }
	attributes: { id: string }[]
}

const remoteOptionForService = (service: ServiceSummaryRow): TRemoteOption => {
	if (service._count.locations === 0) {
		return 'remote-no-location'
	}
	return service.attributes.length > 0 ? 'remote-with-location' : 'in-person-only'
}

/**
 * Collapses each org's raw per-service rows (only fetched for this) into the flat, deduplicated arrays the
 * Service Attributes and Remote Options table columns actually render - service-level detail the client has
 * no other use for and shouldn't need to re-derive itself.
 */
const withServiceSummaries = <T extends { services: ServiceSummaryRow[] }>(
	row: T
): Omit<T, 'services'> & { serviceAttributeIds: string[]; remoteOptions: TRemoteOption[] } => {
	const { services, ...rest } = row
	return {
		...rest,
		serviceAttributeIds: [...new Set(services.flatMap((service) => service.attributeIds))],
		remoteOptions: [...new Set(services.map(remoteOptionForService))],
	}
}

/**
 * Org ids whose earliest `Suggestion` record was submitted by any of these users. `createOrgSuggestion`
 * (shared by both the public "Suggest an Organization" form and the Data Portal's "Add an Organization"
 * modal) always writes exactly one `Suggestion` row in the same transaction as a brand-new `Organization`
 * row; any later Suggestion for that same org can only come from someone suggesting an edit to an org that
 * already exists (it requires `existingOrgId`, see createOrgSuggestion.ts). So the oldest Suggestion per org
 * is always its creation record, regardless of how many edit-suggestions came after it. Orgs predating this
 * flow (or inserted outside it, e.g. a seed/import script) have no Suggestion at all and won't match any
 * user.
 */
const creatorOrgIds = async (userIds: string[]): Promise<string[]> => {
	const rows = await prisma.$queryRaw<{ id: string }[]>`
		SELECT o.id
		FROM "Organization" o
		WHERE EXISTS (
			SELECT 1 FROM "Suggestion" s
			WHERE s."organizationId" = o.id
			AND s."suggestedById" = ANY(${userIds})
			AND s."createdAt" = (
				SELECT MIN(s2."createdAt") FROM "Suggestion" s2 WHERE s2."organizationId" = o.id
			)
		)
	`
	return rows.map((row) => row.id)
}

// Built as top-level `AND` conditions (each its own object) rather than assigning multiple keys directly on
// `where` - `status` and `createMethod` each need their own `OR`, and a plain JS object can only hold one
// `OR` key, so assigning the second after the first silently clobbered it instead of combining (Status +
// Create Method together was actually just Create Method - see user/query.forUserTable.handler.ts for the
// same pattern/reasoning).
const buildWhere = (
	input: TForOrganizationTableSchema,
	idFilters: string[][]
): Prisma.OrganizationWhereInput => {
	const and: Prisma.OrganizationWhereInput[] = []
	const statusClause = statusWhere(input.status)
	if (statusClause) {
		and.push(statusClause)
	}
	if (input.deleted !== undefined) {
		and.push({ deleted: input.deleted })
	}
	const createMethodClause = createMethodWhere(input.createMethod)
	if (createMethodClause) {
		and.push(createMethodClause)
	}
	if (input.lastVerified) {
		and.push({ lastVerified: { gte: input.lastVerified.from, lte: input.lastVerified.to } })
	}
	if (input.updatedAt) {
		and.push({ updatedAt: { gte: input.updatedAt.from, lte: input.updatedAt.to } })
	}
	if (input.createdAt) {
		and.push({ createdAt: { gte: input.createdAt.from, lte: input.createdAt.to } })
	}
	// Each id list (location-phone cleanup, created-by) becomes its own `AND` entry rather than
	// intersecting them by hand - Prisma implicitly ANDs every entry in the array.
	for (const ids of idFilters) {
		and.push({ id: { in: ids } })
	}
	return and.length ? { AND: and } : {}
}

/**
 * Org ids needing the location-phone display-fix cleanup pass: more than one published, non-deleted location,
 * with at least one phone also linked to one of those locations. Before
 * orgPhone/query.forContactInfo.handler.ts's fix, a location-linked number always also showed on the org's
 * own main page; now it only does for a single-location org. Staff use this to find any number on a
 * multi-location org they actually want to keep visible on the main page too, and re-add it there as a
 * separate, plain org-level entry (see the "Location Phone Cleanup" data-portal page). Computed as raw SQL
 * since Prisma's relation filters can express "has at least one" but not "has more than one" without a
 * `_count` aggregate, which isn't usable inside a `where` on a `findMany`.
 */
const locationPhoneCleanupIds = async (): Promise<string[]> => {
	const rows = await prisma.$queryRaw<{ id: string }[]>`
		SELECT o.id
		FROM "Organization" o
		WHERE (
			SELECT count(*) FROM "OrgLocation" l
			WHERE l."orgId" = o.id AND l.published = true AND l.deleted = false
		) > 1
		AND EXISTS (
			SELECT 1
			FROM "OrganizationPhone" op
			JOIN "OrgLocationPhone" olp ON olp."phoneId" = op."phoneId"
			JOIN "OrgLocation" ol ON ol.id = olp."orgLocationId"
			WHERE op."organizationId" = o.id AND ol.published = true AND ol.deleted = false
		)
	`
	return rows.map((row) => row.id)
}

// Sortable columns are whitelisted by the Zod schema (ZSortableColumn) before they ever reach here.
const buildOrderBy = (
	sorting: TForOrganizationTableSchema['sorting']
): Prisma.OrganizationOrderByWithRelationInput[] => {
	const orderBy: Prisma.OrganizationOrderByWithRelationInput[] = (sorting ?? []).map(({ id, desc }) => ({
		[id]: desc ? 'desc' : 'asc',
	}))
	// Stable tiebreaker so take/skip pagination can't skip or duplicate rows across pages.
	orderBy.push({ id: 'asc' })
	return orderBy
}

/**
 * Same normalization as the existing public search (query.searchName.handler.ts): strip accents/punctuation,
 * lowercase, so "loose" matching isn't thrown off by casing or special characters.
 */
const normalize = (fragment: Prisma.Sql) =>
	Prisma.sql`lower(public.immutable_unaccent(regexp_replace(${fragment}, '[^a-zA-Z0-9 ]', '', 'g')))`

interface SearchRow {
	id: string
	total: bigint
}

// SQL equivalent of createMethodWhere, for the raw-SQL search path below - `src` (the joined Source row)
// and `o."creatorHadDpAccess"` are both already in scope by the time this is used.
const createMethodSqlCondition = (
	createMethod: TForOrganizationTableSchema['createMethod']
): Prisma.Sql | undefined => {
	switch (createMethod) {
		case 'public':
			return Prisma.sql`(src.source = 'suggestion' AND o."creatorHadDpAccess" = false)`
		case 'internal':
			return Prisma.sql`((src.source = 'suggestion' AND o."creatorHadDpAccess" = true) OR src.source = 'data-portal')`
		default:
			return undefined
	}
}

// SQL equivalent of statusWhere, for the raw-SQL search path below - `o` (the Organization row) is
// already in scope by the time this is used. Same multi-select union as statusWhere.
const statusSqlCondition = (status: TForOrganizationTableSchema['status']): Prisma.Sql | undefined => {
	if (!status || status.length === 0) {
		return undefined
	}
	const clauses = status.map((s) =>
		s === 'published'
			? Prisma.sql`o.published = true`
			: Prisma.sql`(o.published = false AND o."unpublishedReason" = ${STATUS_FILTER_TO_REASON[s]}::"OrgUnpublishedReason")`
	)
	return Prisma.sql`(${Prisma.join(clauses, ' OR ')})`
}

/**
 * Same synonym-cluster expansion as query.searchName.handler.ts / query.getPotentialMatches.handler.ts: pull
 * any SearchSynonym cluster containing a word from the search term, so e.g. a configured synonym for "trans"
 * also matches org names using the expanded term, not just a literal substring of what was typed.
 */
const expandSearchTerm = async (searchTerm: string): Promise<string[]> => {
	const words = searchTerm.toLowerCase().split(/\s+/)
	const synonymClusters = prisma.searchSynonym
		? await prisma.searchSynonym.findMany({
				where: { terms: { hasSome: words.filter((w) => w.length > 1) } },
			})
		: []
	const expandedTerms = compact([searchTerm, ...synonymClusters.flatMap((c) => c.terms)])
	return [...new Set(expandedTerms.map((t) => t.toLowerCase()))]
}

/**
 * Fuzzy name/slug search, kept as raw SQL because trigram similarity ranking isn't expressible through
 * Prisma's query builder. Returns matching IDs in rank order plus a total count (via a window function, so
 * pagination doesn't need a second query) — the caller re-hydrates the full row shape via a normal
 * `findMany`.
 */
const searchIds = async (
	input: TForOrganizationTableSchema & { search: string },
	idFilters: string[][]
): Promise<{ ids: string[]; total: number }> => {
	const expandedTerms = await expandSearchTerm(input.search)
	const expandedTermsSql = expandedTerms.length
		? Prisma.sql`ARRAY[${Prisma.join(
				expandedTerms.map((t) => {
					const escaped = t.replace(/[^a-zA-Z0-9 ]/g, '')
					return `%${escaped}%`
				})
			)}]`
		: Prisma.sql`ARRAY[]::text[]`

	const conditions: Prisma.Sql[] = [
		Prisma.sql`(
			${normalize(Prisma.sql`o.name`)} ILIKE ANY(${expandedTermsSql})
			OR ${normalize(Prisma.sql`o.name`)} % ${normalize(Prisma.sql`${input.search}::text`)}
			OR o.slug ILIKE ${`%${input.search}%`}
			OR o.id ILIKE ${`%${input.search}%`}
		)`,
	]
	const statusCondition = statusSqlCondition(input.status)
	if (statusCondition) {
		conditions.push(statusCondition)
	}
	if (input.deleted !== undefined) {
		conditions.push(Prisma.sql`o.deleted = ${input.deleted}`)
	}
	if (input.lastVerified?.from) {
		conditions.push(Prisma.sql`o."lastVerified" >= ${input.lastVerified.from}`)
	}
	if (input.lastVerified?.to) {
		conditions.push(Prisma.sql`o."lastVerified" <= ${input.lastVerified.to}`)
	}
	if (input.updatedAt?.from) {
		conditions.push(Prisma.sql`o."updatedAt" >= ${input.updatedAt.from}`)
	}
	if (input.updatedAt?.to) {
		conditions.push(Prisma.sql`o."updatedAt" <= ${input.updatedAt.to}`)
	}
	if (input.createdAt?.from) {
		conditions.push(Prisma.sql`o."createdAt" >= ${input.createdAt.from}`)
	}
	if (input.createdAt?.to) {
		conditions.push(Prisma.sql`o."createdAt" <= ${input.createdAt.to}`)
	}
	const createMethodCondition = createMethodSqlCondition(input.createMethod)
	if (createMethodCondition) {
		conditions.push(createMethodCondition)
	}
	for (const ids of idFilters) {
		conditions.push(Prisma.sql`o.id = ANY(${ids})`)
	}

	// While actively searching, relevance wins over any user-selected column sort — a fuzzy match's rank is
	// the point, not this org's alphabetical position.
	const rows = await prisma.$queryRaw<SearchRow[]>`
		SELECT
			o.id,
			count(*) OVER() as total,
			similarity(${normalize(Prisma.sql`o.name`)}, ${normalize(Prisma.sql`${input.search}::text`)}) as score
		FROM "Organization" o
		LEFT JOIN "Source" src ON src.id = o."sourceId"
		WHERE ${Prisma.join(conditions, ' AND ')}
		ORDER BY score DESC, o.name ASC, o.id ASC
		LIMIT ${input.take}
		OFFSET ${input.skip}
	`
	return { ids: rows.map((row) => row.id), total: Number(rows[0]?.total ?? 0) }
}

const forOrganizationTable = async ({
	input,
}: TRPCHandlerParams<TForOrganizationTableSchema, 'protected'>) => {
	const search = input.search?.trim()

	const [cleanupIds, createdByOrgIds, communityOrgIds, leaderOrgIds, serviceIds] = await Promise.all([
		input.needsLocationPhoneCleanup ? locationPhoneCleanupIds() : undefined,
		input.createdByUserIds?.length ? creatorOrgIds(input.createdByUserIds) : undefined,
		input.communityAttributeIds?.length
			? orgIdsByAttributes(input.communityAttributeIds, input.communityMatchMode)
			: undefined,
		input.leaderAttributeIds?.length
			? orgIdsByAttributes(input.leaderAttributeIds, input.leaderMatchMode)
			: undefined,
		serviceGroupOrgIds(input),
	])
	const computedIdFilters = [cleanupIds, createdByOrgIds, communityOrgIds, leaderOrgIds, serviceIds]
	if (computedIdFilters.some((ids) => ids?.length === 0)) {
		return { results: [], total: 0 }
	}
	const idFilters = computedIdFilters.filter((ids): ids is string[] => ids !== undefined)

	if (search) {
		const { ids, total: searchTotal } = await searchIds({ ...input, search }, idFilters)
		if (ids.length === 0) {
			return { results: [], total: searchTotal }
		}

		const rows = await prisma.organization.findMany({ where: { id: { in: ids } }, select: ORG_SELECT })
		const byId = new Map(rows.map((row) => [row.id, row]))
		const searchResults = compact(ids.map((id) => byId.get(id))).map(withServiceSummaries)

		return { results: searchResults, total: searchTotal }
	}

	const where = buildWhere(input, idFilters)
	const orderBy = buildOrderBy(input.sorting)

	const [results, total] = await Promise.all([
		prisma.organization.findMany({ where, orderBy, select: ORG_SELECT, take: input.take, skip: input.skip }),
		prisma.organization.count({ where }),
	])

	return { results: results.map(withServiceSummaries), total }
}

export default forOrganizationTable
