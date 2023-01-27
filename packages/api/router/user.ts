import { handleError } from '../lib'
import { adminProcedure, defineRouter, protectedProcedure, publicProcedure } from '../lib/trpc'
import { adminCreateUser, createUser, transformUserSurvey, userSurvey } from '../schemas/user'

export const userRouter = defineRouter({
	create: publicProcedure.input(createUser).mutation(async ({ ctx, input }) => {
		try {
			const user = await ctx.prisma.user.create({
				data: {
					...input,
					userType: {
						connect: {
							type: 'seeker',
						},
					},
				},
			})
			return user.id
		} catch (error) {
			handleError(error)
		}
	}),
	adminCreate: adminProcedure.input(adminCreateUser).mutation(async ({ ctx, input }) => {
		try {
			const user = await ctx.prisma.user.create({
				data: input,
			})
			return user.id
		} catch (error) {
			handleError(error)
		}
	}),
	submitSurvey: publicProcedure.input(userSurvey).mutation(async ({ ctx, input }) => {
		try {
			const data = transformUserSurvey(input)
			const survey = await ctx.prisma.userSurvey.create({ data })
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
