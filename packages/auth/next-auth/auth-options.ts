import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { env } from '@weareinreach/config'
import { prisma } from '@weareinreach/db'
import { type NextAuthOptions } from 'next-auth'
import CognitoProvider from 'next-auth/providers/cognito'

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
		CognitoProvider({
			clientId: env.COGNITO_CLIENT_ID as string,
			clientSecret: env.COGNITO_CLIENT_SECRET as string,
			issuer: env.COGNITO_ISSUER,
			allowDangerousEmailAccountLinking: true,
		}),
	],
}
