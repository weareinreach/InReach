import { TRPCError } from '@trpc/server'
import { Prisma } from '@weareinreach/db'

import { defineRouter, publicProcedure, handleError, protectedProcedure } from '~api/lib'

export const queries = defineRouter({
	getFilterOptions: publicProcedure.query(async ({ ctx }) => {
		const result = await ctx.prisma.attribute.findMany({
			where: {
				AND: {
					filterType: {
						not: null,
					},
					active: true,
				},
			},
			select: {
				id: true,
				tsKey: true,
				tsNs: true,
				filterType: true,
			},
			orderBy: {
				tsKey: 'asc',
			},
		})

		return result
	}),
})
