/**
 * Adds `https://` to a web address entered without one (`www.example.org` -> `https://www.example.org`), so
 * it links to that site instead of being treated as a path on ours. Anything that already starts with a
 * scheme (`http:`, `https:`, `mailto:`, ...) and blank values are returned unchanged, apart from surrounding
 * spaces.
 */
export const withUrlScheme = (url: string) => {
	const trimmed = url.trim()
	if (!trimmed || /^[a-z][a-z\d+.-]*:/i.test(trimmed)) {
		return trimmed
	}
	return `https://${trimmed.replace(/^\/+/, '')}`
}

/**
 * Reduces a URL to its bare domain - strips protocol, "www.", and everything from the first /, ?, or # onward
 *
 * - So "https://www.example.org/donate" and "example.org" are treated as the same organization. Previously
 *   copy-pasted identically in `query.getPotentialMatches.handler.ts` and `createOrgSuggestion.ts`.
 */
export const normalizeToDomain = (url: string) =>
	url
		.trim()
		.toLowerCase()
		.replace(/^https?:\/\//, '')
		.replace(/^www\./, '')
		.split(/[/?#]/)[0] ?? ''

/**
 * Normalizes a full URL (domain _and_ path, unlike `normalizeToDomain`) for comparison - strips protocol,
 * "www.", and any trailing slash, lowercases throughout. Two uses: telling whether two URLs under the same
 * domain (e.g. psychologytoday.com/personA vs. psychologytoday.com/personB) are the same page or genuinely
 * different ones, and normalizing what staff enter into the org-URL duplicate-check exceptions list - an
 * entry there can be a bare domain or a deeper path prefix (e.g. "healthgrades.com/doctors"), so it can't be
 * forced down to a domain the way `normalizeToDomain` does.
 */
export const normalizeFullUrl = (url: string) =>
	url
		.trim()
		.toLowerCase()
		.replace(/^https?:\/\//, '')
		.replace(/^www\./, '')
		.replace(/\/+$/, '')

/**
 * Whether `url` falls under `prefix`, respecting path-segment boundaries - "test.com/dr" must not match
 * "test.com/drs" just because the strings happen to share characters. Both arguments are expected to already
 * be normalized the same way (see `normalizeFullUrl`); this only adds the boundary check on top. A
 * bare-domain prefix (no path) still matches everything under it, since "domain" is just the shortest
 * possible prefix.
 */
export const urlMatchesPrefix = (url: string, prefix: string) =>
	url === prefix || url.startsWith(`${prefix}/`)
