/* eslint-disable node/no-process-env */
import { createEnv } from '@t3-oss/env-nextjs'
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
		NEXTAUTH_SECRET: z.string(),
		NEXTAUTH_URL: z.string().url().optional(),
		COGNITO_ACCESS_KEY: z.string(),
		COGNITO_SECRET: z.string(),
		COGNITO_CLIENT_ID: z.string(),
		COGNITO_CLIENT_SECRET: z.string(),
		GOOGLE_PLACES_API_KEY: z.string(),
		S3_ACCESS_KEY: z.string().optional(),
		S3_SECRET: z.string().optional(),
		CACHE_ACCESS_KEY: z.string(),
		CACHE_SECRET: z.string(),
		CACHE_READ_URL: z.string().url(),
		CACHE_WRITE_URL: z.string().url(),
		CROWDIN_TOKEN: z.string().optional(),
		OTEL_SERVER: z.string().url().optional(),
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
	},
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		DATABASE_URL: process.env.DATABASE_URL,
		DB_DIRECT_URL: process.env.DB_DIRECT_URL,
		KV_URL: process.env.KV_URL,
		KV_REST_API_URL: process.env.KV_REST_API_URL,
		KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
		KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN,
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		COGNITO_ACCESS_KEY: process.env.COGNITO_ACCESS_KEY,
		COGNITO_SECRET: process.env.COGNITO_SECRET,
		COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
		COGNITO_CLIENT_SECRET: process.env.COGNITO_CLIENT_SECRET,
		GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
		NEXT_PUBLIC_GOOGLE_MAPS_API: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API,
		// eslint-disable-next-line turbo/no-undeclared-env-vars
		S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
		// eslint-disable-next-line turbo/no-undeclared-env-vars
		S3_SECRET: process.env.S3_SECRET,
		CACHE_ACCESS_KEY: process.env.CACHE_ACCESS_KEY,
		CACHE_SECRET: process.env.CACHE_SECRET,
		CACHE_READ_URL: process.env.CACHE_READ_URL,
		CACHE_WRITE_URL: process.env.CACHE_WRITE_URL,
		CROWDIN_TOKEN: process.env.CROWDIN_TOKEN,
		// eslint-disable-next-line turbo/no-undeclared-env-vars
		PORT: process.env.PORT,
		// eslint-disable-next-line turbo/no-undeclared-env-vars
		OTEL_SERVER: process.env.OTEL_SERVER,
		// eslint-disable-next-line turbo/no-undeclared-env-vars
		NEXT_RUNTIME: process.env.NEXT_RUNTIME,
		// eslint-disable-next-line turbo/no-undeclared-env-vars
		VERCEL: process.env.VERCEL,
		// eslint-disable-next-line turbo/no-undeclared-env-vars
		CI: process.env.CI,
		// eslint-disable-next-line turbo/no-undeclared-env-vars
		VERCEL_URL: process.env.VERCEL_URL,
		// eslint-disable-next-line turbo/no-undeclared-env-vars
		VERCEL_ENV: process.env.VERCEL_ENV,
		// eslint-disable-next-line turbo/no-undeclared-env-vars
		NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
		// eslint-disable-next-line turbo/no-undeclared-env-vars
		NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
	},
	skipValidation: process.env.NODE_ENV === 'development',
})

export const getEnv = <T extends keyof typeof env>(envVar: T): (typeof env)[T] => env[envVar]
