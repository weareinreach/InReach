import flush from 'just-flush'
import { SetOptional } from 'type-fest'
import { z } from 'zod'
import { type AttributesByCategory } from '@weareinreach/db'

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
			const result = await ctx.prisma.attributesByCategory.findMany({
				where,
				orderBy: [{ categoryName: 'asc' }, { attributeName: 'asc' }],
			})
			type FlushedAttributesByCategory = SetOptional<
				AttributesByCategory,
				'interpolationValues' | 'icon' | 'iconBg' | 'badgeRender' | 'dataSchema' | 'dataSchemaName'
			>
			const flushedResults = result.map((item) =>
				flush<FlushedAttributesByCategory>(item)
			) as FlushedAttributesByCategory[]
			return flushedResults
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
				orderBy: { tag: 'asc' },
			})
	),
	languages: publicProcedure
		.input(z.object({ activelyTranslated: z.boolean(), localeCode: z.string() }).partial().optional())
		.query(
			async ({ ctx, input }) =>
				await ctx.prisma.language.findMany({
					where: input,
					select: {
						id: true,
						languageName: true,
						localeCode: true,
						iso6392: true,
						nativeName: true,
						activelyTranslated: true,
					},
					orderBy: { languageName: 'asc' },
				})
		),
	countries: publicProcedure
		.input(
			z
				.object({
					where: z.object({ activeForOrgs: z.boolean(), cca2: z.string() }),
					includeGeo: z.object({ wkt: z.boolean().default(false), json: z.boolean().default(false) }),
				})
				.deepPartial()
				.optional()
		)
		.query(async ({ ctx, input }) => {
			const { where, includeGeo } = input ?? {}
			const result = await ctx.prisma.country.findMany({
				where,
				select: {
					id: true,
					cca2: true,
					name: true,
					dialCode: true,
					flag: true,
					tsKey: true,
					tsNs: true,
					activeForOrgs: true,
					geoJSON: includeGeo?.json,
					geoWKT: includeGeo?.wkt,
				},
				orderBy: {
					name: 'asc',
				},
			})

			return result
		}),
})
