import { TRPCError } from '@trpc/server'

import { handleError } from '../lib'
import { defineRouter, publicProcedure } from '../lib/trpc'
import { id, searchTerm, slug } from '../schemas/common'
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
			return org
		} catch (error) {
			handleError(error)
		}
	}),
	getBySlug: publicProcedure.input(slug).query(async ({ ctx, input }) => {
		try {
			const { slug } = input
			const { include } = organizationInclude
			const org = await ctx.prisma.organization.findUniqueOrThrow({
				where: {
					slug,
				},
				include,
			})
			return org
		} catch (error) {
			handleError(error)
		}
	}),
	getIdFromSlug: publicProcedure.input(slug).query(async ({ ctx, input }) => {
		try {
			const { slug } = input
			const orgId = await ctx.prisma.organization.findUniqueOrThrow({
				where: { slug },
				select: { id: true },
			})
			return orgId
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
