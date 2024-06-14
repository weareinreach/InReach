/* eslint-disable node/no-process-env */
import { createEnv } from '@t3-oss/env-nextjs'
import isChromatic from 'chromatic/isChromatic'
import { z } from 'zod'

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
		DATABASE_URL: z.string().url(),
		DB_DIRECT_URL: z.string().url(),
		KV_URL: z.string().url(),
		KV_REST_API_URL: z.string().url(),
		KV_REST_API_TOKEN: z.string(),
		KV_REST_API_READ_ONLY_TOKEN: z.string(),
		EDGE_CONFIG: z.string().url(),
		EDGE_CONFIG_TOKEN: z.string().optional(),
		FEATURE_FLAG_CONFIG: z.string().url(),
		NEXTAUTH_SECRET: z.string(),
		NEXTAUTH_URL: z.string().url().optional(),
		COGNITO_ACCESS_KEY: z.string(),
		COGNITO_SECRET: z.string(),
		COGNITO_CLIENT_ID: z.string(),
		COGNITO_CLIENT_SECRET: z.string(),
		COGNITO_USER_POOL_ID: z.string(),
		GOOGLE_PLACES_API_KEY: z.string(),
		CROWDIN_TOKEN: z.string().optional(),
		OTEL_SERVER: z.string().url().optional(),
		CRON_KEY: z.string(),
		NEXT_RUNTIME: z.enum(['nodejs', 'edge']),
		VERCEL: z
			.string()
			.transform((s) => s !== 'false' && s !== '0')
			.optional(),
		CI: z
			.string()
			.transform((s) => s !== 'false' && s !== '0')
			.optional(),
		VERCEL_URL: z.string().optional(),
		VERCEL_ENV: z.enum(['production', 'development', 'preview']).optional(),
		PORT: z.string().optional(),
	},
	client: {
		NEXT_PUBLIC_GOOGLE_MAPS_API: z.string(),
		NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
		NEXT_PUBLIC_VERCEL_ENV: z.enum(['production', 'development', 'preview']).optional(),
		NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string(),
	},

	experimental__runtimeEnv: {
		NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
		NEXT_PUBLIC_GOOGLE_MAPS_API: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API,
		NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
		NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
	},
	skipValidation:
		process.env.NODE_ENV === 'development' ||
		process.env.SKIP_ENV_VALIDATION === 'true' ||
		Boolean(process.env.CI) ||
		isChromatic(),
})

export const getEnv = <T extends keyof typeof env>(envVar: T): (typeof env)[T] => env[envVar]

export * from './checks'
