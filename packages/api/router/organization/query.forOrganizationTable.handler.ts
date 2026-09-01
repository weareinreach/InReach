import compact from 'just-compact'

import { Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForOrganizationTableSchema } from './query.forOrganizationTable.schema'

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
} satisfies Prisma.OrganizationSelect

const buildWhere = (input: TForOrganizationTableSchema): Prisma.OrganizationWhereInput => {
	const where: Prisma.OrganizationWhereInput = {}
	if (input.published !== undefined) {
		where.published = input.published
	}
	if (input.deleted !== undefined) {
		where.deleted = input.deleted
	}
	const createMethodClause = createMethodWhere(input.createMethod)
	if (createMethodClause) {
		Object.assign(where, createMethodClause)
	}
	if (input.lastVerified) {
		where.lastVerified = { gte: input.lastVerified.from, lte: input.lastVerified.to }
	}
	if (input.updatedAt) {
		where.updatedAt = { gte: input.updatedAt.from, lte: input.updatedAt.to }
	}
	if (input.createdAt) {
		where.createdAt = { gte: input.createdAt.from, lte: input.createdAt.to }
	}
	return where
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
	input: TForOrganizationTableSchema & { search: string }
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
	if (input.published !== undefined) {
		conditions.push(Prisma.sql`o.published = ${input.published}`)
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

const forOrganizationTable = async ({ input }: TRPCHandlerParams<TForOrganizationTableSchema>) => {
	const search = input.search?.trim()

	if (search) {
		const { ids, total: searchTotal } = await searchIds({ ...input, search })
		if (ids.length === 0) {
			return { results: [], total: searchTotal }
		}

		const rows = await prisma.organization.findMany({ where: { id: { in: ids } }, select: ORG_SELECT })
		const byId = new Map(rows.map((row) => [row.id, row]))
		const searchResults = compact(ids.map((id) => byId.get(id)))

		return { results: searchResults, total: searchTotal }
	}

	const where = buildWhere(input)
	const orderBy = buildOrderBy(input.sorting)

	const [results, total] = await Promise.all([
		prisma.organization.findMany({ where, orderBy, select: ORG_SELECT, take: input.take, skip: input.skip }),
		prisma.organization.count({ where }),
	])

	return { results, total }
}

export default forOrganizationTable
