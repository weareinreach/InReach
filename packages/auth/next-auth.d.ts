/* eslint-disable import/no-unused-modules */
import { DefaultSession } from 'next-auth'

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

declare module 'next-auth' {
	export interface Session extends DefaultSession {
		user: CustomUser & DefaultSession['user']
	}
}
