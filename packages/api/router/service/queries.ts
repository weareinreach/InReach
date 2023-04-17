import { TRPCError } from '@trpc/server'
import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

import { defineRouter, publicProcedure, handleError, protectedProcedure } from '~api/lib'
import {
	serviceById,
	serviceByLocationId,
	serviceByOrgId,
	serviceByUserListId,
} from '~api/schemas/selects/orgService'

export const queries = defineRouter({
	byId: publicProcedure.input(serviceById).query(async ({ ctx, input }) => {
		try {
			const result = await ctx.prisma.orgService.findUniqueOrThrow(input)

			return result
		} catch (error) {
			handleError(error)
		}
	}),
	byOrgId: publicProcedure.input(serviceByOrgId).query(async ({ ctx, input }) => {
		try {
			const results = await ctx.prisma.orgService.findMany(input)
			return results
		} catch (error) {
			handleError(error)
		}
	}),
	byOrgLocationId: publicProcedure.input(serviceByLocationId).query(async ({ ctx, input }) => {
		try {
			const results = await ctx.prisma.orgService.findMany(input)
			return results
		} catch (error) {
			handleError(error)
		}
	}),
	byUserListId: protectedProcedure.input(serviceByUserListId).query(async ({ ctx, input }) => {
		try {
			const { select, where } = input
			const revisedInput = {
				where: {
					userLists: {
						some: {
							list: {
								AND: {
									id: where.userLists.some.listId,
									ownedById: ctx.session.user.id,
								},
							},
						},
					},
				},
				select,
			} satisfies Prisma.OrgServiceFindManyArgs

			const results = await ctx.prisma.orgService.findMany(revisedInput)
			return results
		} catch (error) {
			handleError(error)
		}
	}),
	getFilterOptions: publicProcedure.query(async ({ ctx }) => {
		const result = await ctx.prisma.serviceCategory.findMany({
			where: {
				active: true,
			},
			select: {
				id: true,
				tsKey: true,
				tsNs: true,
				services: {
					where: {
						active: true,
					},
					select: {
						id: true,
						tsKey: true,
						tsNs: true,
					},
					orderBy: {
						tsKey: 'asc',
					},
				},
			},
			orderBy: {
				tsKey: 'asc',
			},
		})
		return result
	}),
	getParentName: publicProcedure
		.input(z.object({ slug: z.string(), orgLocationId: z.string() }).partial())
		.query(async ({ ctx, input }) => {
			const { slug, orgLocationId } = input

			switch (true) {
				case Boolean(slug): {
					return await ctx.prisma.organization.findUniqueOrThrow({
						where: { slug },
						select: { name: true },
					})
				}
				case Boolean(orgLocationId): {
					return await ctx.prisma.orgLocation.findUniqueOrThrow({
						where: { id: orgLocationId },
						select: { name: true },
					})
				}
				default: {
					throw new TRPCError({ code: 'BAD_REQUEST' })
				}
			}
		}),
})
