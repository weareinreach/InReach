import compact from 'just-compact'

import { Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetPotentialMatchesSchema } from './query.getPotentialMatches.schema'

// Reduces a URL to its bare domain - strips protocol, "www.", and everything from the first /, ?, or #
// onward - so "https://www.example.org/donate" and "example.org" are treated as the same organization.
const normalizeToDomain = (url: string) =>
	url
		.trim()
		.toLowerCase()
		.replace(/^https?:\/\//, '')
		.replace(/^www\./, '')
		.split(/[/?#]/)[0] ?? ''

const levenshteinDistance = (a: string, b: string) => {
	const rows = Array.from({ length: a.length + 1 }, (_, i) =>
		Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
	)
	for (let i = 1; i <= a.length; i++) {
		for (let j = 1; j <= b.length; j++) {
			const row = rows[i]
			const prevRow = rows[i - 1]
			if (!row || !prevRow) continue
			row[j] =
				a[i - 1] === b[j - 1]
					? (prevRow[j - 1] ?? 0)
					: 1 + Math.min(prevRow[j] ?? 0, row[j - 1] ?? 0, prevRow[j - 1] ?? 0)
		}
	}
	return rows[a.length]?.[b.length] ?? Math.max(a.length, b.length)
}

const NEAR_MISS_MAX_DISTANCE = 2

// Splits a normalized domain into its name and TLD (e.g. "aclu.org" -> { name: "aclu", tld: "org" }) on
// the last dot. Good enough for the simple .com/.org/.net-style TLDs expected here - not meant to handle
// multi-part TLDs like ".co.uk".
const splitDomain = (domain: string) => {
	const lastDot = domain.lastIndexOf('.')
	return lastDot === -1
		? { name: domain, tld: '' }
		: { name: domain.slice(0, lastDot), tld: domain.slice(lastDot + 1) }
}

type MatchRow = {
	id: string
	name: string
	slug: string
	city: string | null
	state: string | null
	deleted: boolean
	published: boolean
}

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

	const normalizedWebsite = website ? normalizeToDomain(website) : undefined

	// Website duplicates: a broad substring pre-filter in SQL (via Prisma's query builder, not raw SQL),
	// then an exact domain comparison in JS - avoids hand-rolling regex/backreference logic in raw SQL,
	// which proved fragile (both a SQL syntax error and a silent false-negative in practice).
	let websiteMatchOrgIds = new Set<string>()
	if (normalizedWebsite) {
		const candidates = await prisma.orgWebsite.findMany({
			where: { url: { contains: normalizedWebsite, mode: 'insensitive' } },
			select: { url: true, organizationId: true },
		})
		websiteMatchOrgIds = new Set(
			candidates
				.filter((candidate) => normalizeToDomain(candidate.url) === normalizedWebsite)
				.map((candidate) => candidate.organizationId)
				.filter((id): id is string => Boolean(id))
		)
	}

	/**
	 * Raw SQL query leveraging Trigram similarity and synonym expansion for fuzzy name matching - there's no
	 * Prisma query-builder equivalent for trigram similarity, so this part stays raw SQL.
	 */
	const nameResults = searchTerm
		? await prisma.$queryRaw<MatchRow[]>`
    SELECT
      o.id,
      o.name,
      o.slug,
      o.deleted,
      o.published,
      l.city,
      gd.abbrev as state
    FROM "Organization" o
    LEFT JOIN "OrgLocation" l ON l."orgId" = o.id AND l.primary = true
    LEFT JOIN "GovDist" gd ON l."govDistId" = gd.id
    WHERE
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
    ORDER BY
      similarity(o.name, ${searchTerm}) DESC
    LIMIT 5;
  `
		: []

	// If the website matched an organization the name search didn't already surface (different/unrelated
	// name, same domain), fetch its display info too, so a pure website-only duplicate still gets flagged.
	const missingIds = [...websiteMatchOrgIds].filter((id) => !nameResults.some((r) => r.id === id))
	const extraOrgs: MatchRow[] = missingIds.length
		? (
				await prisma.organization.findMany({
					where: { id: { in: missingIds } },
					select: {
						id: true,
						name: true,
						slug: true,
						deleted: true,
						published: true,
						locations: {
							where: { primary: true },
							take: 1,
							select: { city: true, govDist: { select: { abbrev: true } } },
						},
					},
				})
			).map((org) => ({
				id: org.id,
				name: org.name,
				slug: org.slug,
				deleted: org.deleted,
				published: org.published,
				city: org.locations[0]?.city ?? null,
				state: org.locations[0]?.govDist?.abbrev ?? null,
			}))
		: []

	// No cap here beyond nameResults' own `LIMIT 5` (already applied in its SQL query above) - a website
	// exact match must never be silently dropped just because 5 unrelated name-similarity suggestions
	// filled the list first. `extraOrgs` is essentially always 0-1 items in practice (an exact-website
	// duplicate is one specific org), so this doesn't risk an unbounded list.
	const merged = [...nameResults, ...extraOrgs]

	// Near-miss website check: only against orgs whose NAME already matched (a strong prior), and only
	// those that aren't already an exact website match. Two independent signals catch two different typo
	// shapes: edit distance catches a dropped/extra/swapped letter (e.g. "aclu.or" vs "aclu.org"), while
	// the same-name-different-TLD check catches a wrong-but-valid TLD (e.g. "aclu.com" vs "aclu.org") -
	// those can differ by 3+ characters, well past the edit-distance threshold, despite being an obvious
	// mistake once you notice the name part is identical.
	const nearMissByOrgId = new Map<string, string>()
	if (normalizedWebsite) {
		const inputDomain = splitDomain(normalizedWebsite)
		const nameMatchIdsWithoutExactWebsite = nameResults
			.map((r) => r.id)
			.filter((id) => !websiteMatchOrgIds.has(id))
		if (nameMatchIdsWithoutExactWebsite.length > 0) {
			const candidateWebsites = await prisma.orgWebsite.findMany({
				where: { organizationId: { in: nameMatchIdsWithoutExactWebsite } },
				select: { organizationId: true, url: true },
			})
			for (const candidate of candidateWebsites) {
				if (!candidate.organizationId || nearMissByOrgId.has(candidate.organizationId)) continue
				const candidateDomain = normalizeToDomain(candidate.url)
				const candidateSplit = splitDomain(candidateDomain)
				const distance = levenshteinDistance(normalizedWebsite, candidateDomain)
				const sameNameDifferentTld =
					inputDomain.name !== '' &&
					inputDomain.name === candidateSplit.name &&
					inputDomain.tld !== candidateSplit.tld
				if ((distance > 0 && distance <= NEAR_MISS_MAX_DISTANCE) || sameNameDifferentTld) {
					nearMissByOrgId.set(candidate.organizationId, candidateDomain)
				}
			}
		}
	}

	return merged.map((r) => ({
		...r,
		city: r.city ?? 'Remote',
		state: r.state ?? '',
		websiteMatch: websiteMatchOrgIds.has(r.id),
		websiteNearMatch: nearMissByOrgId.get(r.id) ?? null,
	}))
}

export default getPotentialMatches
