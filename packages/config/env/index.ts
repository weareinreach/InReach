/* eslint-disable node/no-process-env */
import { parseEnv, z } from 'znv'

import { vercelProvidedEnv } from './vercel'
/**
 * Parsed & validated env variables.
 *
 * Why? @see {@link https://github.com/lostfictions/znv#motivation}
 */

export const env = parseEnv(process.env, {
	...vercelProvidedEnv,
	COGNITO_ACCESS_KEY: z.string().default(''),
	COGNITO_SECRET: z.string().default(''),
	COGNITO_CLIENT_ID: z.string().default(''),
	COGNITO_CLIENT_SECRET: z.string().default(''),
	NODE_ENV: {
		schema: z.enum(['production', 'development']).optional(),
		description: 'Node environment',
		defaults: {
			development: 'development' as const,
			production: 'production' as const,
		},
	},
	PORT: {
		schema: z.number().min(1024).max(65536).optional(),
		defaults: {
			development: 3000,
		},
	},
	MONGO_URI: {
		schema: z.string().optional(),
		description: 'This is only used for the database migration process.',
	},
	/** @see {@link https://next-auth.js.org/configuration/options} */
	NEXTAUTH_URL: {
		schema: z.string().url().default('http://localhost:3000'),
		defaults: {
			development: 'http://localhost:3000',
		},
	},
	/** @see {@link https://next-auth.js.org/configuration/options} */
	NEXTAUTH_SECRET: {
		schema: z.string().default(''),
		description:
			'Used to encrypt the NextAuth.js JWT, and to hash email verification tokens. This is the default value for the secret option in NextAuth and Middleware.',
	},
})

export const getEnv = <K extends EnvKeys>(envVar: K): EnvParse[K] | string => {
	const envResult = env[envVar]
	// const envResult = process.env[envVar]
	// console.log(`Get env: ${envVar}. Result: ${envResult}`)
	return envResult as string
}

type EnvKeys = keyof typeof env
type EnvParse = {
	[K in keyof typeof env]: (typeof env)[K]
}
