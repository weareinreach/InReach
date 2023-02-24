import { handleError } from '~api/lib'
import { getCoveredAreas, searchOrgByDistance } from '~api/lib/prismaRaw'
import { defineRouter, publicProcedure } from '~api/lib/trpc'
import { id, searchTerm, slug, distSearch, idArray } from '~api/schemas/common'
import { SearchDetailsOutput } from '~api/schemas/outputTransform/org'
import { isPublic } from '~api/schemas/selects/common'
import { organizationInclude, orgSearchSelect } from '~api/schemas/selects/org'

export const queries = defineRouter({
	getById: publicProcedure.input(id).query(async ({ ctx, input }) => {
		try {
			const { select } = organizationInclude
			const org = await ctx.prisma.organization.findUniqueOrThrow({
				where: {
					id: input.id,
					...isPublic,
				},
				select,
			})
			return org
		} catch (error) {
			handleError(error)
		}
	}),
	getBySlug: publicProcedure.input(slug).query(async ({ ctx, input }) => {
		try {
			const { slug } = input
			const { select } = organizationInclude
			const org = await ctx.prisma.organization.findUniqueOrThrow({
				where: {
					slug,
					...isPublic,
				},
				select,
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
				where: { slug, ...isPublic },
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
					...isPublic,
				},
				select: {
					id: true,
					name: true,
					slug: true,
				},
			})
			return orgIds
		} catch (error) {
			handleError(error)
		}
	}),
	searchDistance: publicProcedure.input(distSearch).query(async ({ ctx, input }) => {
		const { lat, lon, dist, unit } = input
		// TODO: Merge in getSearchDetails
		// TODO: Return distances in same unit as searched

		// Convert to meters
		const searchRadius = unit === 'km' ? dist * 1000 : Math.round(dist * 1.60934 * 1000)

		const serviceAreas = await getCoveredAreas({ lat, lon }, ctx)
		const orgs = await searchOrgByDistance({ lat, lon, searchRadius }, ctx)

		return { orgs, serviceAreas }
	}),
	getSearchDetails: publicProcedure.input(idArray).query(async ({ ctx, input }) => {
		try {
			const results = await ctx.prisma.organization.findMany({
				where: {
					id: {
						in: input.ids,
					},
					...isPublic,
				},
				select: orgSearchSelect,
			}) //satisfies SearchDetailsResultInput
			const orderedResults: typeof results = []
			input.ids.forEach((id) => {
				const sort = results.find((result) => result.id === id)
				if (sort) orderedResults.push(sort)
			})
			return SearchDetailsOutput.parse(orderedResults)
		} catch (error) {
			handleError(error)
		}
	}),
})
