import compact from 'just-compact'

import { Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetPotentialMatchesSchema } from './query.getPotentialMatches.schema'

const getPotentialMatches = async ({ input }: TRPCHandlerParams<TGetPotentialMatchesSchema>) => {
	const { name, website } = input

	if (!name && !website) return []

	const searchTerm = name?.trim() ?? ''
	let uniqueExpandedTerms: string[] = []

	if (searchTerm) {
		const words = searchTerm.toLowerCase().split(/\s+/)
		let synonymClusters: { terms: string[] }[] = []
		// Defensive check: Ensure prisma.searchSynonym is available before calling findMany
		if (prisma.searchSynonym) {
			synonymClusters = await prisma.searchSynonym.findMany({
				where: {
					terms: { hasSome: words.filter((w) => w.length > 1) }, // Ignore single letters in expansion
				},
			})
		}

		// Flatten all synonyms into a single list for the SQL query
		const expandedTerms = compact([searchTerm, ...synonymClusters.flatMap((c) => c.terms)])
		// Remove duplicates and normalize for SQL
		uniqueExpandedTerms = [...new Set(expandedTerms.map((t) => t.toLowerCase()))]
	}

	const expandedTermsSql =
		searchTerm && uniqueExpandedTerms.length > 0
			? Prisma.sql`ARRAY[${Prisma.join(uniqueExpandedTerms.map((t) => `%${t.replace(/[^a-zA-Z0-9 ]/g, '')}%`))}]`
			: Prisma.sql`ARRAY[]::text[]`

	// Normalize website down to its bare domain (strip protocol, www, and everything from the first
	// /, ?, or # onward) so "https://www.example.org/donate" and "example.org" count as the same site.
	const normalizedWebsite = website
		? website
				.trim()
				.toLowerCase()
				.replace(/^https?:\/\//, '')
				.replace(/^www\./, '')
				.split(/[/?#]/)[0]
		: undefined

	/**
	 * Raw SQL query leveraging Trigram similarity and normalization. We match on fuzzy name similarity OR an
	 * exact domain-level website match.
	 */
	const results = await prisma.$queryRaw<
		{
			id: string
			name: string
			slug: string
			city: string | null
			state: string | null
			deleted: boolean
			published: boolean
			websiteMatch: boolean
		}[]
	>`
    SELECT
      o.id,
      o.name,
      o.slug,
      o.deleted,
      o.published,
      l.city,
      gd.abbrev as state,
      (
        ${!!normalizedWebsite} AND
        EXISTS (
          SELECT 1 FROM "OrgWebsite" ow
          WHERE ow."organizationId" = o.id
          AND regexp_replace(lower(ow.url), '^(https?://)?(www\.)?([^/?#]+).*$', '\3') = ${normalizedWebsite ?? ''}
        )
      ) as "websiteMatch"
    FROM "Organization" o
    LEFT JOIN "OrgLocation" l ON l."orgId" = o.id AND l.primary = true
    LEFT JOIN "GovDist" gd ON l."govDistId" = gd.id
    WHERE
      (
        (
          ${!!searchTerm} AND
          (
            -- 1. Expanded Term Matching (Synonyms and substrings)
            lower(public.immutable_unaccent(regexp_replace(o.name, '[^a-zA-Z0-9 ]', '', 'g'))) ILIKE ANY(
              ${expandedTermsSql}
            )
            OR
            -- 2. Trigram similarity for typos
            similarity(
              lower(public.immutable_unaccent(regexp_replace(o.name, '[^a-zA-Z0-9 ]', '', 'g'))),
              lower(public.immutable_unaccent(regexp_replace(${searchTerm}, '[^a-zA-Z0-9 ]', '', 'g')))
            ) > 0.3
          )
        )
        OR
        (
          ${!!normalizedWebsite} AND
          EXISTS (
            SELECT 1 FROM "OrgWebsite" ow
            WHERE ow."organizationId" = o.id
            AND regexp_replace(lower(ow.url), '^(https?://)?(www\.)?([^/?#]+).*$', '\3') = ${normalizedWebsite ?? ''}
          )
        )
      )
    ORDER BY
      CASE WHEN ${!!searchTerm} THEN similarity(o.name, ${searchTerm}) ELSE 0 END DESC
    LIMIT 5;
  `

	return results.map((r) => ({
		...r,
		city: r.city ?? 'Remote',
		state: r.state ?? '',
		deleted: r.deleted,
		published: r.published,
		websiteMatch: r.websiteMatch,
	}))
}

export default getPotentialMatches
