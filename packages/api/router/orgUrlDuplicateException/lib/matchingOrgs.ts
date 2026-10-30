import { prisma } from '@weareinreach/db'
import { normalizeFullUrl, urlMatchesPrefix } from '@weareinreach/util/url'

export type MatchingOrg = {
	id: string
	name: string
	slug: string
	deleted: boolean
	published: boolean
}

/**
 * Every organization currently using a website under the given base URL (a bare domain or a deeper path
 * prefix) - shown as a row's expanded children in the Org URL Duplicate Check Exceptions table, so staff can
 * see who's actually using it before deciding whether the exception still makes sense. Same
 * substring-prefilter-then-exact-compare approach as `organization.getPotentialMatches`, for the same reason
 * (no clean Prisma query-builder equivalent for "match after normalization" without raw SQL); the exact
 * compare is boundary-aware (`urlMatchesPrefix`) so a narrower exception only surfaces orgs under that
 * specific prefix, not the whole domain.
 */
export const findMatchingOrgs = async (baseUrl: string): Promise<MatchingOrg[]> => {
	const candidates = await prisma.orgWebsite.findMany({
		where: { url: { contains: baseUrl, mode: 'insensitive' } },
		select: { url: true, organizationId: true },
	})
	const orgIds = [
		...new Set(
			candidates
				.filter((candidate) => urlMatchesPrefix(normalizeFullUrl(candidate.url), baseUrl))
				.map((candidate) => candidate.organizationId)
				.filter((id): id is string => Boolean(id))
		),
	]
	if (!orgIds.length) {
		return []
	}
	return prisma.organization.findMany({
		where: { id: { in: orgIds } },
		select: { id: true, name: true, slug: true, deleted: true, published: true },
	})
}
