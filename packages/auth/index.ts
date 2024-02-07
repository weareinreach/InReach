import { type DefaultSession, type DefaultUser, type User } from 'next-auth/core/types'
import { type DefaultJWT } from 'next-auth/jwt'

export { getServerSession, checkServerPermissions } from './next-auth/session.server'
export { checkPermissions } from './next-auth/session.browser'
export type { Session } from 'next-auth'

export * from './lib'

/**
 * Module augmentation for `next-auth` types Allows us to add custom properties to the `session` object and
 * keep type safety
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth/core/types' {
	export interface Session extends DefaultSession {
		user: User
	}
	export interface User extends DefaultUser {
		id: string
		// email?: never
		email: string
		roles: string[]
		permissions: string[]
	}
}
declare module 'next-auth/jwt' {
	export interface JWT extends DefaultJWT {
		user: User
	}
}
