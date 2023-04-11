import { z } from 'zod'

import { defineRouter, publicProcedure } from '~api/lib/trpc'
import { serviceAreaSelect } from '~api/schemas/selects/location'

export const fieldOptRouter = defineRouter({
	/** All government districts by country (active for org listings). Gives 2 levels of sub-districts */
	govDistsByCountry: publicProcedure
		.meta({
			description:
				'All government districts by country (active for org listings). Gives 2 levels of sub-districts',
		})
		.input(z.string().optional().describe('Country CCA2 code'))
		.query(async ({ ctx, input }) => {
			const data = await ctx.prisma.country.findMany({
				where: {
					cca2: input,
					activeForOrgs: true,
				},
				select: serviceAreaSelect,
				orderBy: {
					cca2: 'asc',
				},
			})
			return data
		}),
})
