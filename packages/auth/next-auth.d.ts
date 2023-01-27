// eslint-disable-next-line import/no-unused-modules
import { DefaultSession, DefaultUser } from 'next-auth'

/**
 * Module augmentation for `next-auth` types Allows us to add custom properties to the `session` object and
 * keep type safety
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

declare module 'next-auth' {
	export interface Session extends DefaultSession {
		user: User
	}
	export interface User extends DefaultUser {
		id: string
		roles: string[]
		permissions: string[]
		email: string
	}
}
