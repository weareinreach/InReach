import compact from 'just-compact'

import { Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForOrganizationTableSchema } from './query.forOrganizationTable.schema'

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
} satisfies Prisma.OrganizationSelect

const buildWhere = (input: TForOrganizationTableSchema): Prisma.OrganizationWhereInput => {
	const where: Prisma.OrganizationWhereInput = {}
	if (input.published !== undefined) where.published = input.published
	if (input.deleted !== undefined) where.deleted = input.deleted
	if (input.lastVerified) where.lastVerified = { gte: input.lastVerified.from, lte: input.lastVerified.to }
	if (input.updatedAt) where.updatedAt = { gte: input.updatedAt.from, lte: input.updatedAt.to }
	if (input.createdAt) where.createdAt = { gte: input.createdAt.from, lte: input.createdAt.to }
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
		? Prisma.sql`ARRAY[${Prisma.join(expandedTerms.map((t) => `%${t.replace(/[^a-zA-Z0-9 ]/g, '')}%`))}]`
		: Prisma.sql`ARRAY[]::text[]`

	const conditions: Prisma.Sql[] = [
		Prisma.sql`(
			${normalize(Prisma.sql`o.name`)} ILIKE ANY(${expandedTermsSql})
			OR ${normalize(Prisma.sql`o.name`)} % ${normalize(Prisma.sql`${input.search}::text`)}
			OR o.slug ILIKE ${`%${input.search}%`}
			OR o.id ILIKE ${`%${input.search}%`}
		)`,
	]
	if (input.published !== undefined) conditions.push(Prisma.sql`o.published = ${input.published}`)
	if (input.deleted !== undefined) conditions.push(Prisma.sql`o.deleted = ${input.deleted}`)
	if (input.lastVerified?.from) conditions.push(Prisma.sql`o."lastVerified" >= ${input.lastVerified.from}`)
	if (input.lastVerified?.to) conditions.push(Prisma.sql`o."lastVerified" <= ${input.lastVerified.to}`)
	if (input.updatedAt?.from) conditions.push(Prisma.sql`o."updatedAt" >= ${input.updatedAt.from}`)
	if (input.updatedAt?.to) conditions.push(Prisma.sql`o."updatedAt" <= ${input.updatedAt.to}`)
	if (input.createdAt?.from) conditions.push(Prisma.sql`o."createdAt" >= ${input.createdAt.from}`)
	if (input.createdAt?.to) conditions.push(Prisma.sql`o."createdAt" <= ${input.createdAt.to}`)

	// While actively searching, relevance wins over any user-selected column sort — a fuzzy match's rank is
	// the point, not this org's alphabetical position.
	const rows = await prisma.$queryRaw<SearchRow[]>`
		SELECT
			o.id,
			count(*) OVER() as total,
			similarity(${normalize(Prisma.sql`o.name`)}, ${normalize(Prisma.sql`${input.search}::text`)}) as score
		FROM "Organization" o
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
		const { ids, total } = await searchIds({ ...input, search })
		if (ids.length === 0) return { results: [], total }

		const rows = await prisma.organization.findMany({ where: { id: { in: ids } }, select: ORG_SELECT })
		const byId = new Map(rows.map((row) => [row.id, row]))
		const results = compact(ids.map((id) => byId.get(id)))

		return { results, total }
	}

	const where = buildWhere(input)
	const orderBy = buildOrderBy(input.sorting)

	const [results, total] = await Promise.all([
		prisma.organization.findMany({ where, select: ORG_SELECT, orderBy, take: input.take, skip: input.skip }),
		prisma.organization.count({ where }),
	])

	return { results, total }
}

export default forOrganizationTable
