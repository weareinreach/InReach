import { prisma } from '@weareinreach/db'

/**
 * Every path-segment prefix of a normalized URL, e.g. "a.com/b/c" -> ["a.com/b/c", "a.com/b", "a.com"]. The
 * bare domain is always included, since a domain-only exception is just the shortest possible prefix.
 */
const prefixesOf = (normalizedUrl: string): string[] => {
	const segments = normalizedUrl.split('/')
	return segments.map((_, i) => segments.slice(0, segments.length - i).join('/'))
}

/**
 * The most specific active exception covering `normalizedUrl` (expects the same normalization
 * `normalizeFullUrl` produces), or `null` if none apply. Looked up by generating every path-segment prefix of
 * the URL and querying them all in one `IN` against `baseUrl`'s unique index, rather than a
 * `startsWith`/`contains` scan - segment prefixes are exact strings, so this also gets the "test.com/dr" vs.
 * "test.com/drs" boundary check for free, with no separate check needed afterward. A broader exception still
 * covers a URL even if a narrower, more specific one under it was later deleted.
 */
export const findMatchingException = async (normalizedUrl: string) => {
	const candidates = prefixesOf(normalizedUrl)
	const exceptions = await prisma.orgUrlDuplicateException.findMany({
		where: { baseUrl: { in: candidates } },
	})
	const active = exceptions.filter((exception) => exception.active)
	active.sort((a, b) => b.baseUrl.length - a.baseUrl.length)
	return active[0] ?? null
}
