// @ts-check
import { z } from 'zod'

/**
 * Specify your server-side environment variables schema here. This way you can ensure the app isn't built
 * with invalid env vars.
 */
export const serverSchema = z
	.object({
		// SERVERVAR: z.string(),
		SENTRY_DSN: z.string(),
		SANITY_TOKEN: z.string().optional(),
		NODE_ENV: z.string(),
	})
	.deepPartial()

/**
 * Specify your client-side environment variables schema here. This way you can ensure the app isn't built
 * with invalid env vars. To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z
	.object({
		// NEXT_PUBLIC_CLIENTVAR: z.string(),
		NEXT_PUBLIC_SENTRY_DSN: z.string(),
		NEXT_PUBLIC_SANITY_PROJECT_ID: z.string(),
		NEXT_PUBLIC_SANITY_DATASET: z.string(),
		NEXT_PUBLIC_SANITY_API_VERSION: z.string(),
	})
	.deepPartial()

/**
 * You can't destruct `process.env` as a regular object, so you have to do it manually here. This is because
 * Next.js evaluates this at build time, and only used environment variables are included in the build.
 *
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
export const clientEnv = {
	// NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
	NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
	NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
	NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
	NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
}
