import { createCognitoUser } from '@weareinreach/auth'
import { type Prisma } from '@weareinreach/db'

import { handleError } from '~api/lib'
import { adminProcedure, defineRouter, protectedProcedure, publicProcedure } from '~api/lib/trpc'
import {
	AdminCreateUser,
	CreateUser,
	CreateUserSurvey,
	type AdminCreateUserInput,
} from '~api/schemas/create/user'

export const userRouter = defineRouter({
	create: publicProcedure.input(CreateUser).mutation(async ({ ctx, input }) => {
		try {
			const newUser = await ctx.prisma.$transaction(async (tx) => {
				const user = await tx.user.create(input.prisma)
				const cognitoUser = await createCognitoUser(input.cognito)
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
})
