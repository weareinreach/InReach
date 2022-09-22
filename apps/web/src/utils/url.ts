/**
 * It replaces all occurrences of two or more slashes with a single slash
 *
 * "/product//" => "/product/"
 * @param {string} path - The path to the file or directory.
 * @returns A function that takes a string and returns a string with all double slashes removed.
 */
function removeDoubleSlashes(path: string) {
	return path.replace(/\/{2,}/g, "/");
}

/**
 * It takes a slug and returns a path
 *
 * "contact/" => "/contact/"
 * @param {string} slug - The slug of the page.
 * @returns A string with a leading slash and no trailing slash.
 */
export function getPathFromSlug(slug: string) {
	return removeDoubleSlashes(`/${slug || ""}`);
}

/**
 * It takes a slug and a base URL and returns an absolute URL
 *
 * "/about" => "https://my-site.com/about"
 * @param {string} slug - The slug of the page you want to link to.
 * @param {string} baseUrl - The base URL of the site.
 * @returns A function that takes a slug and a baseUrl and returns a string.
 */
export function slugToAbsUrl(slug: string, baseUrl: string) {
	return baseUrl + getPathFromSlug(slug);
}

/**
 * It takes a slug and returns an array of slugs that are all the possible variations of that
 * slug with slashes
 * @param {string} slug - The slug to generate variations for.
 * @returns An array of strings.
 */
export function getSlugVariations(slug: string) {
	const slashless = slug.replace(/\//g, "");
	return [
		slashless,
		// /slash-on-both-ends/
		`/${slashless}/`,
		// trailing/
		`${slashless}/`,
		// /leading
		`/${slashless}`,
	];
}

/**
 * Convert a slug parameter from getStaticProps to a path.
 * @param {string | string[]} slugParam - The value of the slug parameter in the route.
 * @returns A function that takes a string or an array of strings and returns a string.
 */
export function slugParamToPath(slugParam: string | string[] | undefined) {
	// Possible slug value types:
	const slug = Array.isArray(slugParam)
		? // - ["multiple", "paths"]
		  slugParam.join("/")
		: // - "single-path"
		  slugParam ||
		  // - undefined -> default to "/"
		  "/";
	return slug;
}
