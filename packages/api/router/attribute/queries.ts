import { z } from 'zod'

import { defineRouter, publicProcedure, staffProcedure } from '~api/lib/trpc'

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
	getOne: staffProcedure
		.input(z.object({ id: z.string() }).or(z.object({ tag: z.string() })))
		.query(async ({ ctx, input }) => {
			const result = await ctx.prisma.attribute.findUniqueOrThrow({
				where: input,
				select: {
					id: true,
					tag: true,
					tsKey: true,
					tsNs: true,
					icon: true,
					iconBg: true,
					active: true,
					requireBoolean: true,
					requireData: true,
					requireDataSchema: { select: { definition: true } },
					requireGeo: true,
					requireLanguage: true,
					requireText: true,
				},
			})
			return result
		}),
})
