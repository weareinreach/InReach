import compact from 'just-compact'

import { Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TSearchNameSchema } from './query.searchName.schema'

interface SearchNameResult {
	id: string
	name: string
	slug: string
	score: number
}

/**
 * Perform a smart search on organization names. Uses PostgreSQL 'unaccent' and 'pg_trgm' extensions to ignore
 * diacritics, punctuation, and handle fuzzy matching/typos.
 */
const searchName = async ({ input }: TRPCHandlerParams<TSearchNameSchema>) => {
	const searchTerm = input.search.trim()

	if (!searchTerm) {
		return []
	}

	// 1. Term Expansion (Thesaurus Logic)
	// Find clusters that contain the search term or any of its words.
	const words = searchTerm.toLowerCase().split(/\s+/)

	let synonymClusters: { terms: string[] }[] = []
	// Defensive check: Ensure prisma.searchSynonym is available before calling findMany
	if (prisma.searchSynonym) {
		synonymClusters = await prisma.searchSynonym.findMany({
			where: {
				terms: { hasSome: words.filter((w) => w.length > 1) }, // Ignore single letters in expansion
			},
		})
	} else {
		console.warn("Prisma client does not have 'searchSynonym' model. Synonym expansion will be skipped.")
	}

	// Flatten all synonyms into a single list for the SQL query
	const expandedTerms = compact([searchTerm, ...synonymClusters.flatMap((c) => c.terms)])
	// Remove duplicates and normalize for SQL
	const uniqueExpandedTerms = [...new Set(expandedTerms.map((t) => t.toLowerCase()))]

	const results = await prisma.$queryRaw<SearchNameResult[]>`
		SELECT
			id,
			name,
			slug,
			-- Calculate similarity score for ranking (1.0 is exact match)
			similarity(
				lower(unaccent(regexp_replace(name, '[^a-zA-Z0-9 ]', '', 'g'))),
				lower(unaccent(regexp_replace(${searchTerm}, '[^a-zA-Z0-9 ]', '', 'g')))
			) as score
		FROM "Organization"
		WHERE
			(
				-- 2. Expanded Term Matching
				-- Checks the name against the original term and any synonyms
				lower(unaccent(regexp_replace(name, '[^a-zA-Z0-9 ]', '', 'g'))) ILIKE ANY(
					ARRAY[${Prisma.join(uniqueExpandedTerms.map((t) => `%${t.replace(/[^a-zA-Z0-9 ]/g, '')}%`))}]
				)
				OR
				-- 3. Trigram fuzzy match for typos (still using original term for best accuracy)
				lower(unaccent(regexp_replace(name, '[^a-zA-Z0-9 ]', '', 'g'))) %
				lower(unaccent(regexp_replace(${searchTerm}, '[^a-zA-Z0-9 ]', '', 'g')))
			)
			AND published = true
			AND deleted = false
		ORDER BY score DESC, name ASC
		LIMIT 20
	`

	const shaped = results.map(({ name, id, slug }) => ({ value: name, label: name, id, slug }))

	return shaped
}
export default searchName
