import { env } from "../src/env/client.mjs";

export const config = {
	/**
	 * Find your project ID and dataset in `sanity.config.ts` in your studio project.
	 * These are considered “public”, but you can use environment variables
	 * if you want differ between local dev and production.
	 *
	 * https://nextjs.org/docs/basic-features/environment-variables
	 **/
	dataset: env.NEXT_PUBLIC_SANITY_DATASET || "production",
	projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
	apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION, // Learn more: https://www.sanity.io/docs/api-versioning
	/**
	 * Set useCdn to `false` if your application require the freshest possible
	 * data always (potentially slightly slower and a bit more expensive).
	 * Authenticated request (like preview) will always bypass the CDN
	 **/
	useCdn: process.env.NODE_ENV === "production",

	/**
	 * OPTIONAL config to enable authentication with custom token
	 * You might need this if you host the preview on a different url than Sanity Studio
	 */
	// token: '<sanity access token>',
	// EventSource: /* provide your own event source implementation. Required in browsers to support the above token parameter. */
};
