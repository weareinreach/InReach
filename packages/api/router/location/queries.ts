import { TRPCError } from '@trpc/server'

import { defineRouter, publicProcedure, handleError } from '~api/lib'
import { id, orgId } from '~api/schemas/common'
import { orgLocationInclude } from '~api/schemas/selects/org'

export const queries = defineRouter({
	byId: publicProcedure.input(id).query(async ({ ctx, input }) => {
		try {
			const location = await ctx.prisma.orgLocation.findUniqueOrThrow({
				where: {
					id: input.id,
				},
				...orgLocationInclude,
			})
			return location
		} catch (error) {
			handleError(error)
		}
	}),
	byOrg: publicProcedure.input(orgId).query(async ({ ctx, input }) => {
		try {
			const locations = await ctx.prisma.orgLocation.findMany({
				where: {
					orgId: input.orgId,
				},
			})
			if (locations.length === 0) throw new TRPCError({ code: 'NOT_FOUND' })
			return locations
		} catch (error) {
			handleError(error)
		}
	}),
})
