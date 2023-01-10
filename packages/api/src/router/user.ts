import { adminCreateUser, createUser, transformUserSurvey, userSurvey } from '../schemas/user'
import { adminProcedure, protectedProcedure, publicProcedure, router } from '../trpc'

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
			},
		})
		return profile
	}),
})
