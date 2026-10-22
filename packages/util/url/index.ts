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
