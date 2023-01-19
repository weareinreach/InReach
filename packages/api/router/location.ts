import { defineRouter, publicProcedure, handleError } from '../lib'
import { id } from '../schemas/common'
import { orgLocationInclude } from '../schemas/selects/org'

export const locationRouter = defineRouter({
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
})
