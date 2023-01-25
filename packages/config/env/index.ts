import { parseEnv, z } from 'znv'

import { vercelProvidedEnv } from './vercel'
/**
 * Parsed & validated env variables.
 *
 * Why? @see {@link https://github.com/lostfictions/znv#motivation}
 */
// eslint-disable-next-line node/no-process-env
export const env = parseEnv(process.env, {
	...vercelProvidedEnv,
	COGNITO_ACCESS_KEY: z.string(),
	COGNITO_SECRET: z.string(),
	COGNITO_CLIENT_ID: z.string(),
	COGNITO_CLIENT_SECRET: z.string(),
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
		schema: z.string(),
		description: 'This is only used for the database migration process.',
	},
	/** @see {@link https://next-auth.js.org/configuration/options} */
	NEXTAUTH_URL: {
		schema: z.string().url(),
		defaults: {
			development: 'http://localhost:3000',
		},
	},
	/** @see {@link https://next-auth.js.org/configuration/options} */
	NEXTAUTH_SECRET: {
		schema: z.string(),
		description:
			'Used to encrypt the NextAuth.js JWT, and to hash email verification tokens. This is the default value for the secret option in NextAuth and Middleware.',
	},
})
