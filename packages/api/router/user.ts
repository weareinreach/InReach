import { adminProcedure, protectedProcedure, publicProcedure, router } from '~/lib/trpc'
import { adminCreateUser, createUser, transformUserSurvey, userSurvey } from '~/schemas/user'

export const userRouter = router({
	create: publicProcedure.input(createUser).mutation(async ({ ctx, input }) => {
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
	}),
	adminCreate: adminProcedure.input(adminCreateUser).mutation(async ({ ctx, input }) => {
		const user = await ctx.prisma.user.create({
			data: input,
		})
		return user.id
	}),
	submitSurvey: publicProcedure.input(userSurvey).mutation(async ({ ctx, input }) => {
		const data = transformUserSurvey(input)
		const survey = await ctx.prisma.userSurvey.create({ data })
		return survey.id
	}),
	getProfile: protectedProcedure.query(async ({ ctx }) => {
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
	}),
	getUserReviews: protectedProcedure.query(async ({ ctx }) => {
		const reviews = await ctx.prisma.orgReview.findMany({
			where: {
				userId: ctx.session.user.id,
			},
			include: {
				organization: true,
				orgLocation: true,
				orgService: true,
			},
		})
		return reviews
	}),
	getPermissions: protectedProcedure.query(async ({ ctx }) => {
		const permissions = await ctx.prisma.userPermission.findMany({
			where: {
				userId: ctx.session.user.id,
			},
			include: {
				permission: true,
			},
		})
		return permissions
	}),
	getOrgPermissions: protectedProcedure.query(async ({ ctx }) => {
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
	}),
	getLocationPermissions: protectedProcedure.query(async ({ ctx }) => {
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
	}),
})
