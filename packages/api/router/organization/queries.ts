import { handleError } from '~api/lib'
import { getCoveredAreas, searchOrgByDistance } from '~api/lib/prismaRaw'
import { defineRouter, publicProcedure, staffProcedure } from '~api/lib/trpc'
import { id, searchTerm, slug, distSearch, idArray } from '~api/schemas/common'
import { SearchDetailsOutput } from '~api/schemas/outputTransform/org'
import { organizationInclude, orgSearchSelect } from '~api/schemas/selects/org'

export const queries = defineRouter({
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
	searchDistance: publicProcedure.input(distSearch).query(async ({ ctx, input }) => {
		const { lat, lon, dist, unit } = input

		// Convert to meters
		const searchRadius = unit === 'km' ? dist * 1000 : Math.round(dist * 1.60934 * 1000)

		const serviceAreas = await getCoveredAreas({ lat, lon }, ctx)
		const orgs = await searchOrgByDistance({ lat, lon, searchRadius }, ctx)

		return { orgs, serviceAreas }
	}),
	getSearchDetails: publicProcedure
		.input(idArray)
		.output(SearchDetailsOutput)
		.query(async ({ ctx, input }) => {
			try {
				const results = await ctx.prisma.organization.findMany({
					where: {
						id: {
							in: input.ids,
						},
					},
					select: orgSearchSelect,
				}) //satisfies SearchDetailsResultInput

				return results
			} catch (error) {
				handleError(error)
			}
		}),
})
