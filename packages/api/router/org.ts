import { TRPCError } from '@trpc/server'

import { handleError } from '../lib'
import { defineRouter, publicProcedure } from '../lib/trpc'
import { id, searchTerm } from '../schemas/common'
import { organizationInclude } from '../schemas/selects/org'

export const orgRouter = defineRouter({
	getById: publicProcedure.input(id).query(async ({ ctx, input }) => {
		try {
			const { include } = organizationInclude
			const org = await ctx.prisma.organization.findUniqueOrThrow({
				where: {
					id: input.id,
				},
				include,
			})
			if (!org) throw new TRPCError({ code: 'NOT_FOUND' })
			return org
		} catch (error) {
			handleError(error)
		}
	}),
	searchName: publicProcedure.input(searchTerm).query(async ({ ctx, input }) => {
		try {
			const orgIds = await ctx.prisma.organization.findMany({
				where: {
					name: {
						contains: input.search,
						mode: 'insensitive',
					},
				},
				select: {
					id: true,
					name: true,
				},
			})
			return orgIds
		} catch (error) {
			handleError(error)
		}
	}),
})
