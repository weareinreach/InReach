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
 * - so "https://www.example.org/donate" and "example.org" are treated as the same organization. Previously
 * copy-pasted identically in `query.getPotentialMatches.handler.ts` and `createOrgSuggestion.ts`; also used
 * by the org-URL duplicate-check exceptions list, which stores base URLs in this same normalized form.
 */
export const normalizeToDomain = (url: string) =>
	url
		.trim()
		.toLowerCase()
		.replace(/^https?:\/\//, '')
		.replace(/^www\./, '')
		.split(/[/?#]/)[0] ?? ''

/**
 * Normalizes a full URL (not just its domain) for exact-match comparison - strips protocol, "www.", and any
 * trailing slash, lowercases throughout. Used to tell whether two URLs under the same exception-listed base
 * domain (e.g. psychologytoday.com/personA vs. psychologytoday.com/personB) are the same page or genuinely
 * different ones - a byte-for-byte string compare would treat a trailing slash or a different case as a
 * "different" URL when it isn't.
 */
export const normalizeFullUrl = (url: string) =>
	url
		.trim()
		.toLowerCase()
		.replace(/^https?:\/\//, '')
		.replace(/^www\./, '')
		.replace(/\/+$/, '')
