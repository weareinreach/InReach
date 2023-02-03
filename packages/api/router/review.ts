import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

import { handleError } from '../lib'
import { auditLog } from '../lib/auditLog'
import { defineRouter, protectedProcedure, publicProcedure, staffProcedure } from '../lib/trpc'
import { id, orgId, orgIdLocationId, orgIdServiceId, userId } from '../schemas/common'
import { createReview } from '../schemas/review'

export const reviewRouter = defineRouter({
	create: protectedProcedure.input(createReview).mutation(async ({ ctx, input }) => {
		try {
			const auditLogs = auditLog<typeof input, 'userSavedList'>({
				table: 'userSavedList',
				operation: 'create',
				actorId: ctx.session.user.id,
				to: input,
			})

			const data: Prisma.OrgReviewCreateArgs['data'] = {
				...input,
				userId: ctx.session.user.id,
				auditLogs,
			}
			const review = await ctx.prisma.orgReview.create({ data, select: { id: true } })

			return review
		} catch (error) {
			handleError(error)
		}
	}),
	getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
		try {
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
		} catch (error) {
			handleError(error)
		}
	}),
	getByOrg: publicProcedure.input(orgId).query(async ({ ctx, input }) => {
		try {
			const reviews = await ctx.prisma.orgReview.findMany({
				where: {
					organizationId: input.orgId,
				},
			})
			return reviews
		} catch (error) {
			handleError(error)
		}
	}),
	getByLocation: publicProcedure.input(orgIdLocationId).query(async ({ ctx, input }) => {
		try {
			const reviews = await ctx.prisma.orgReview.findMany({
				where: {
					organizationId: input.orgId,
					orgLocationId: input.locationId,
				},
			})
			return reviews
		} catch (error) {
			handleError(error)
		}
	}),
	getByService: publicProcedure.input(orgIdServiceId).query(async ({ ctx, input }) => {
		try {
			const reviews = await ctx.prisma.orgReview.findMany({
				where: {
					organizationId: input.orgId,
					orgServiceId: input.serviceId,
				},
			})
			return reviews
		} catch (error) {
			handleError(error)
		}
	}),
	getByUser: staffProcedure
		.input(userId)
		.meta({ hasPerm: 'viewUserReviews' })
		.query(async ({ ctx, input }) => {
			try {
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
			} catch (error) {
				handleError(error)
			}
		}),
	hide: staffProcedure
		.input(id)
		.meta({ hasPerm: 'hideUserReview' })
		.mutation(async ({ ctx, input }) => {
			try {
				const result = await ctx.prisma.orgReview.update({
					where: {
						id: input.id,
					},
					data: {
						visible: false,
					},
				})
				return result
			} catch (error) {
				handleError(error)
			}
		}),
	unHide: staffProcedure
		.input(id)
		.meta({ hasPerm: 'showUserReview' })
		.mutation(async ({ ctx, input }) => {
			try {
				const result = await ctx.prisma.orgReview.update({
					where: {
						id: input.id,
					},
					data: {
						visible: true,
					},
				})
				return result
			} catch (error) {
				handleError(error)
			}
		}),
	delete: protectedProcedure
		.input(id)
		.meta({ hasPerm: 'deleteUserReview' })
		.mutation(async ({ ctx, input }) => {
			try {
				const review = ctx.prisma.orgReview.update({
					where: {
						id: input.id,
					},
					data: {
						deleted: true,
					},
				})
				return review
			} catch (error) {
				handleError(error)
			}
		}),
	unDelete: protectedProcedure
		.input(id)
		.meta({ hasPerm: 'deleteUserReview' })
		.mutation(async ({ ctx, input }) => {
			try {
				const review = ctx.prisma.orgReview.update({
					where: {
						id: input.id,
					},
					data: {
						deleted: false,
					},
				})
				return review
			} catch (error) {
				handleError(error)
			}
		}),
})
