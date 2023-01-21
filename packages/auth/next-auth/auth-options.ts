import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@weareinreach/db'
import { type NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
	// Include user.id on session
	callbacks: {
		session({ session, user }) {
			if (session.user) {
				session.user.id = user.id
			}
			return session
		},
	},
	// Configure one or more authentication providers
	adapter: PrismaAdapter(prisma),
	providers: [
		Credentials({
			name: 'Cognito',
			credentials: {
				email: { label: 'Email', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			authorize: async (credentials, req) => {
				console.log(credentials, req)
				//placeholder
				return {
					id: '',
				}
			},
		}),
	],
}
