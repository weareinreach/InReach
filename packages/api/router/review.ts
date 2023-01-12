import { Prisma } from '@weareinreach/db'

import { defineRouter, protectedProcedure, publicProcedure, staffProcedure } from '../lib/trpc'
import { id, orgId, orgIdLocationId, orgIdServiceId, userId } from '../schemas/common'
import { createReview, transformCreateReview } from '../schemas/review'

export const reviewRouter = defineRouter({
	create: protectedProcedure.input(createReview).mutation(async ({ ctx, input }) => {
		const data: Prisma.OrgReviewCreateInput = {
			...transformCreateReview(input),
			user: {
				connect: {
					id: ctx.session.user.id,
				},
			},
		}
		const review = await ctx.prisma.orgReview.create({ data })
		return review
	}),
	getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
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
	getByOrg: publicProcedure.input(orgId).query(async ({ ctx, input }) => {
		const reviews = await ctx.prisma.orgReview.findMany({
			where: {
				organizationId: input.orgId,
			},
		})
		return reviews
	}),
	getByLocation: publicProcedure.input(orgIdLocationId).query(async ({ ctx, input }) => {
		const reviews = await ctx.prisma.orgReview.findMany({
			where: {
				organizationId: input.orgId,
				orgLocationId: input.locationId,
			},
		})
		return reviews
	}),
	getByService: publicProcedure.input(orgIdServiceId).query(async ({ ctx, input }) => {
		const reviews = await ctx.prisma.orgReview.findMany({
			where: {
				organizationId: input.orgId,
				orgServiceId: input.serviceId,
			},
		})
		return reviews
	}),
	getByUser: staffProcedure
		.input(userId)
		.meta({ hasPerm: 'viewUserReviews' })
		.query(async ({ ctx, input }) => {
			const reviews = await ctx.prisma.orgReview.findMany({
				where: {
					userId: input.userId,
				},
				include: {
					organization: true,
					orgLocation: true,
					orgService: true,
				},
			})
			return reviews
		}),
	hide: staffProcedure
		.input(id)
		.meta({ hasPerm: 'hideUserReview' })
		.mutation(async ({ ctx, input }) => {
			const result = await ctx.prisma.orgReview.update({
				where: {
					id: input.id,
				},
				data: {
					visible: false,
				},
			})
			return result
		}),
	unHide: staffProcedure
		.input(id)
		.meta({ hasPerm: 'showUserReview' })
		.mutation(async ({ ctx, input }) => {
			const result = await ctx.prisma.orgReview.update({
				where: {
					id: input.id,
				},
				data: {
					visible: true,
				},
			})
			return result
		}),
	delete: protectedProcedure
		.input(id)
		.meta({ hasPerm: 'deleteUserReview' })
		.mutation(async ({ ctx, input }) => {
			const review = ctx.prisma.orgReview.update({
				where: {
					id: input.id,
				},
				data: {
					deleted: true,
				},
			})
			return review
		}),
	unDelete: protectedProcedure
		.input(id)
		.meta({ hasPerm: 'deleteUserReview' })
		.mutation(async ({ ctx, input }) => {
			const review = ctx.prisma.orgReview.update({
				where: {
					id: input.id,
				},
				data: {
					deleted: false,
				},
			})
			return review
		}),
})
