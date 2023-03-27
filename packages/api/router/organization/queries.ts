import { z } from 'zod'

import { handleError } from '~api/lib'
import { getCoveredAreas, searchOrgByDistance } from '~api/lib/prismaRaw'
import { defineRouter, publicProcedure } from '~api/lib/trpc'
import { prismaDistSearchDetails } from '~api/prisma/org'
import { id, searchTerm, slug, idArray } from '~api/schemas/common'
import { serviceFilter, attributeFilter } from '~api/schemas/filters/org'
import { distSearch } from '~api/schemas/org/search'
import { isPublic } from '~api/schemas/selects/common'
import { organizationInclude } from '~api/schemas/selects/org'

export const queries = defineRouter({
	getById: publicProcedure.input(id).query(async ({ ctx, input }) => {
		try {
			const { select } = organizationInclude(ctx)
			const org = await ctx.prisma.organization.findUniqueOrThrow({
				where: {
					id: input.id,
					...isPublic,
				},
				select,
			})
			const { allowedEditors, ...orgData } = org
			const reformatted = {
				...orgData,
				isClaimed: Boolean(allowedEditors.length),
				services: org.services.map((serv) => ({ service: serv })),
			}

			return reformatted
		} catch (error) {
			handleError(error)
		}
	}),
	getBySlug: publicProcedure.input(slug).query(async ({ ctx, input }) => {
		try {
			const { slug } = input
			const { select } = organizationInclude(ctx)
			const org = await ctx.prisma.organization.findUniqueOrThrow({
				where: {
					slug,
					...isPublic,
				},
				select,
			})
			const { allowedEditors, ...orgData } = org
			const reformatted = {
				...orgData,
				isClaimed: Boolean(allowedEditors.length),
				services: org.services.map((serv) => ({ service: serv })),
			}

			return reformatted
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
			const shaped = orgIds.map(({ name, ...rest }) => ({ value: name, name, ...rest }))
			return shaped
		} catch (error) {
			handleError(error)
			return []
		}
	}),
	searchDistance: publicProcedure.input(distSearch).query(async ({ ctx, input }) => {
		const { lat, lon, dist, unit, skip, take, services, attributes } = input
		// Convert to meters
		const searchRadius = unit === 'km' ? dist * 1000 : Math.round(dist * 1.60934 * 1000)
		const serviceAreas = await getCoveredAreas({ lat, lon }, ctx)
		const orgs = await searchOrgByDistance({ lat, lon, searchRadius }, ctx)
		const resultIds = orgs.map(({ id }) => id)

		const resultDetailWhere = {
			id: {
				in: resultIds,
			},
			...attributeFilter(attributes),
			...serviceFilter(services),
			...isPublic,
		}
		const resultCount = await ctx.prisma.organization.count({ where: resultDetailWhere })

		const results = await prismaDistSearchDetails({ ctx, input: { ...input, resultIds } })

		const orderedResults: ((typeof results)[number] & { distance: number; unit: 'km' | 'mi' })[] = []
		orgs.forEach(({ id, distMeters }) => {
			const distance = unit === 'km' ? distMeters / 1000 : distMeters / 1000 / 1.60934
			const sort = results.find((result) => result.id === id)
			if (sort) orderedResults.push({ ...sort, distance: +distance.toFixed(2), unit })
		})
		return { orgs: orderedResults, serviceAreas, resultCount }
	}),
	getNameFromSlug: publicProcedure.input(z.string()).query(
		async ({ ctx, input }) =>
			await ctx.prisma.organization.findUniqueOrThrow({
				where: {
					slug: input,
				},
				select: {
					name: true,
				},
			})
	),
	isSaved: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
		if (!ctx.session?.user.id) return false

		const listEntries = await ctx.prisma.savedOrganization.findMany({
			where: {
				list: {
					ownedById: ctx.session.user.id,
				},
				organization: {
					slug: input,
				},
			},
			select: {
				list: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		})

		if (!listEntries.length) return false
		const lists = listEntries.map(({ list }) => list)
		return lists
	}),
})
