/* eslint-disable import/no-unused-modules */
import { DefaultSession } from 'next-auth/core/types'

export { authOptions } from './next-auth/auth-options'
export { getServerSession } from './next-auth/get-session'

export type { Session } from 'next-auth'

/**
 * Module augmentation for `next-auth` types Allows us to add custom properties to the `session` object and
 * keep type safety
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

type CustomUser = {
	id: string
	role: string
	permissions: string[]
}

declare module 'next-auth/core/types' {
	export interface Session extends DefaultSession {
		user: CustomUser & DefaultSession['user']
	}
}
