import { defineRouter, publicProcedure } from '~api/lib/trpc'

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
	get: permissionedProcedure,
})
