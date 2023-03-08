import { z } from 'zod'

import { handleError } from '~api/lib'
import { defineRouter, protectedProcedure, publicProcedure, staffProcedure } from '~api/lib/trpc'
import { id, orgId, orgIdLocationId, orgIdServiceId, userId, reviewAvgId } from '~api/schemas/common'
import { CreateReview, CreateReviewInput } from '~api/schemas/create/review'
import { ReviewVisibility, ReviewToggleDelete } from '~api/schemas/update/review'

export const reviewRouter = defineRouter({
	create: protectedProcedure.input(z.object(CreateReviewInput)).mutation(async ({ ctx, input }) => {
		try {
			const { data } = CreateReview.parse({ ...input, userId: ctx.session.user.id })

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
	/** Returns user reviews ready for public display. Takes reviewer's privacy preferences in to account */
	getByIds: publicProcedure.input(z.string().array()).query(async ({ ctx, input }) => {
		const results = await ctx.prisma.orgReview.findMany({
			where: {
				id: {
					in: input,
				},
				visible: true,
				deleted: false,
			},
			select: {
				id: true,
				rating: true,
				reviewText: true,
				user: {
					select: {
						name: true,
						image: true,
						fieldVisibility: {
							select: {
								name: true,
								image: true,
								currentCity: true,
								currentGovDist: true,
								currentCountry: true,
							},
						},
						permissions: {
							where: {
								permission: {
									name: 'isLCR',
								},
							},
						},
					},
				},
				language: {
					select: {
						languageName: true,
						nativeName: true,
					},
				},
				langConfidence: true,
				translatedText: {
					select: {
						text: true,
						language: {
							select: { localeCode: true },
						},
					},
				},
				lcrCity: true,
				lcrGovDist: {
					select: {
						tsKey: true,
						tsNs: true,
					},
				},
				lcrCountry: {
					select: {
						tsNs: true,
						tsKey: true,
					},
				},
				createdAt: true,
			},
		})

		const filteredResults = results.map((result) => {
			const {
				name: nameVisible,
				image: imageVisible,
				currentCity: cityVisible,
				currentGovDist: distVisible,
				currentCountry: countryVisible,
			} = result.user.fieldVisibility ?? {
				name: false,
				image: false,
				currentCity: false,
				currentGovDist: false,
				currentCountry: false,
			}

			return {
				...result,
				user: {
					image: imageVisible ? result.user.image : null,
					name: nameVisible ? result.user.name : null,
				},
				lcrCity: cityVisible ? result.lcrCity : null,
				lcrGovDist: distVisible ? result.lcrGovDist : null,
				lcrCountry: countryVisible ? result.lcrCountry : null,
				verifiedUser: Boolean(result.user.permissions.length),
			}
		})
		return filteredResults
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
				const inputData = {
					...input,
					actorId: ctx.session.user.id,
					visible: false,
				} satisfies z.input<typeof ReviewVisibility>

				const data = ReviewVisibility.parse(inputData)

				const result = await ctx.prisma.orgReview.update(data)
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
				const inputData = {
					...input,
					actorId: ctx.session.user.id,
					visible: true,
				} satisfies z.input<typeof ReviewVisibility>

				const data = ReviewVisibility.parse(inputData)

				const result = await ctx.prisma.orgReview.update(data)
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
				const inputData = {
					...input,
					actorId: ctx.session.user.id,
					deleted: true,
				} satisfies z.input<typeof ReviewToggleDelete>
				const data = ReviewToggleDelete.parse(inputData)

				const result = await ctx.prisma.orgReview.update(data)
				return result
			} catch (error) {
				handleError(error)
			}
		}),
	unDelete: protectedProcedure
		.input(id)
		.meta({ hasPerm: 'deleteUserReview' })
		.mutation(async ({ ctx, input }) => {
			try {
				const inputData = {
					...input,
					actorId: ctx.session.user.id,
					deleted: false,
				} satisfies z.input<typeof ReviewToggleDelete>
				const data = ReviewToggleDelete.parse(inputData)

				const result = await ctx.prisma.orgReview.update(data)
				return result
			} catch (error) {
				handleError(error)
			}
		}),
	getAverage: publicProcedure.input(reviewAvgId).query(async ({ ctx, input }) => {
		const { orgLocationId, orgServiceId, organizationId } = input
		const result = await ctx.prisma.orgReview.aggregate({
			_avg: {
				rating: true,
			},
			_count: {
				rating: true,
			},
			where: {
				orgLocationId,
				orgServiceId,
				organizationId,
			},
		})
		return { average: result._avg.rating, count: result._count.rating }
	}),
})
