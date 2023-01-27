import { z } from 'znv'

/**
 * These env variables are provided by Vercel.
 *
 * @see {@link https://vercel.com/docs/concepts/projects/environment-variables#system-environment-variables}
 */
export const vercelProvidedEnv = {
	VERCEL: z.boolean().optional(),
	CI: z.boolean().optional(),
	VERCEL_URL: z.string().optional(),
	VERCEL_ENV: z.enum(['production', 'development', 'preview']).optional(),
	NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
	NEXT_PUBLIC_VERCEL_ENV: z.enum(['production', 'development', 'preview']).optional(),
}
