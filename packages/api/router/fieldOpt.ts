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
	getPhoneTypes: publicProcedure.query(
		async ({ ctx }) =>
			await ctx.prisma.phoneType.findMany({
				where: { active: true },
				select: {
					id: true,
					tsKey: true,
					tsNs: true,
				},
				orderBy: { type: 'asc' },
			})
	),
	attributesByCategory: publicProcedure
		.input(z.string().or(z.string().array()).optional().describe('categoryName'))
		.query(async ({ ctx, input }) => {
			const where = Array.isArray(input)
				? { categoryName: { in: input } }
				: typeof input === 'string'
				? { categoryName: input }
				: undefined
			const result = await ctx.prisma.attributesByCategory.findMany({ where })
			return result
		}),
	attributeCategories: publicProcedure.input(z.string().array().optional()).query(
		async ({ ctx, input }) =>
			await ctx.prisma.attributeCategory.findMany({
				where: { active: true, ...(input?.length ? { tag: { in: input } } : {}) },
				select: {
					id: true,
					tag: true,
					name: true,
					icon: true,
					intDesc: true,
				},
			})
	),
})
