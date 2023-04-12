import { TRPCError } from '@trpc/server'
import {
	createCognitoUser,
	forgotPassword,
	confirmAccount,
	resetPassword,
	userLogin,
	deleteAccount,
} from '@weareinreach/auth'
import { z } from 'zod'

import { handleError, decodeUrl } from '~api/lib'
import { adminProcedure, defineRouter, protectedProcedure, publicProcedure } from '~api/lib/trpc'
import {
	AdminCreateUser,
	CreateUser,
	CreateUserSurvey,
	type AdminCreateUserInput,
	CognitoBase64,
	ResetPassword,
	ForgotPassword,
} from '~api/schemas/create/user'

export const userRouter = defineRouter({
	create: publicProcedure.input(CreateUser).mutation(async ({ ctx, input }) => {
		// TODO: [IN-793] Alter signup input to match with Signup Flow data.
		try {
			const newUser = await ctx.prisma.$transaction(async (tx) => {
				const user = await tx.user.create(input.prisma)
				if (user.id !== input.cognito.databaseId) throw new Error('Database ID mismatch')
				const cognitoUser = await createCognitoUser(input.cognito)
				if (cognitoUser?.prismaAccount) await tx.account.create(cognitoUser.prismaAccount)

				if (user.id && cognitoUser?.cognitoId) return { success: true }
			})
			return newUser
		} catch (error) {
			handleError(error)
		}
	}),
	adminCreate: adminProcedure.input(AdminCreateUser().inputSchema).mutation(async ({ ctx, input }) => {
		try {
			const inputData = {
				actorId: ctx.session.user.id,
				operation: 'CREATE',
				data: input,
			} satisfies AdminCreateUserInput

			const recordData = AdminCreateUser().dataParser.parse(inputData)
			const newUser = await ctx.prisma.$transaction(async (tx) => {
				const user = await tx.user.create(recordData.prisma)
				const cognitoUser = await createCognitoUser(recordData.cognito)
				return {
					user,
					cognitoUser,
				}
			})
			return newUser
		} catch (error) {
			handleError(error)
		}
	}),
	submitSurvey: publicProcedure.input(CreateUserSurvey).mutation(async ({ ctx, input }) => {
		try {
			const survey = await ctx.prisma.userSurvey.create(input)
			return survey.id
		} catch (error) {
			handleError(error)
		}
	}),
	getProfile: protectedProcedure.query(async ({ ctx }) => {
		try {
			const profile = await ctx.prisma.user.findFirst({
				where: {
					id: ctx.session.user.id,
				},
				select: {
					id: true,
					createdAt: true,
					updatedAt: true,
					name: true,
					email: true,
					image: true,
					active: true,
				},
			})
			return profile
		} catch (error) {
			handleError(error)
		}
	}),
	getPermissions: protectedProcedure.query(async ({ ctx }) => {
		try {
			const permissions = await ctx.prisma.userPermission.findMany({
				where: {
					userId: ctx.session.user.id,
				},
				include: {
					permission: true,
				},
			})
			return permissions
		} catch (error) {
			handleError(error)
		}
	}),
	getOrgPermissions: protectedProcedure.query(async ({ ctx }) => {
		try {
			const permissions = await ctx.prisma.organizationPermission.findMany({
				where: {
					userId: ctx.session.user.id,
				},
				include: {
					organization: true,
					permission: true,
				},
			})
			return permissions
		} catch (error) {
			handleError(error)
		}
	}),
	getLocationPermissions: protectedProcedure.query(async ({ ctx }) => {
		try {
			const permissions = await ctx.prisma.locationPermission.findMany({
				where: {
					userId: ctx.session.user.id,
				},
				include: {
					location: true,
					permission: true,
				},
			})
			return permissions
		} catch (error) {
			handleError(error)
		}
	}),
	forgotPassword: publicProcedure.input(ForgotPassword).mutation(async ({ input }) => {
		const response = await forgotPassword(input)
		return response
	}),
	confirmAccount: publicProcedure.input(CognitoBase64).mutation(async ({ input }) => {
		const { code, email } = input
		const response = await confirmAccount(email, code)
		return response
	}),
	resetPassword: publicProcedure.input(ResetPassword).mutation(async ({ input }) => {
		const { code, password, email } = input
		const response = await resetPassword({ code, email, password })
		return response
	}),
	deleteAccount: protectedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
		const { email } = ctx.session.user
		const cognitoSession = await userLogin(email, input)
		if (cognitoSession.success) {
			const successful = await ctx.prisma.$transaction(async (tx) => {
				await tx.user.update({
					where: { email },
					data: { active: false },
				})

				await deleteAccount(email)
				return true
			})
			if (successful) return true
		}
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'incorrect credentials' })
	}),
})
