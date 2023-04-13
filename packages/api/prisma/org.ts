import { Prisma } from '@weareinreach/db'
import { getDistance } from 'geolib'

import { Context } from '~api/lib'
import { attributeFilter, serviceFilter } from '~api/schemas/filters'
import { DistSearch } from '~api/schemas/org/search'
import { isPublic } from '~api/schemas/selects/common'
import { orgSearchSelect } from '~api/schemas/selects/org'

export const prismaDistSearchDetails = async ({ ctx, input }: PrismaSearchDistance) => {
	const { resultIds, skip, take, lat: latitude, lon: longitude, attributes, services } = input
	const results = await ctx.prisma.organization.findMany({
		where: {
			id: { in: resultIds },
			...attributeFilter(attributes),
			...serviceFilter(services),
			...isPublic,
		},
		select: orgSearchSelect,
		skip,
		take,
	})

	const transformed = results.map(({ attributes, description, locations, services, ...rest }) => {
		const servIds = new Set<string>()
		const attribIds = new Set<string>()
		const cities: City[] = []
		const serviceTagMap = new Map<string, IdKeyNs>()
		const serviceCategoryMap = new Map<string, IdKeyNs>()
		const attributeMap = new Map<string, Attribute>()

		services.forEach(({ services }) =>
			services.forEach(({ tag, service }) => {
				const { id, tsKey, tsNs, category } = tag
				servIds.add(id)
				serviceCategoryMap.set(category.id, category)
				serviceTagMap.set(id, { id, tsKey, tsNs })
				service.attributes.forEach(({ attribute }) => {
					const { categories, ...rest } = attribute
					attribIds.add(rest.id)
					categories.forEach(({ category }) =>
						attributeMap.set(`${rest.id}${category.tag}`, { category, ...rest })
					)
				})
			})
		)

		locations.forEach(({ services, city, ...coords }) => {
			cities.push({
				city,
				dist: getDistance(
					{ latitude, longitude },
					{ latitude: coords.latitude ?? 0, longitude: coords.longitude ?? 0 },
					1000
				),
			})
			services.forEach(({ service }) =>
				service.services.forEach(({ tag, service }) => {
					const { id, tsKey, tsNs, category } = tag
					servIds.add(id)
					serviceCategoryMap.set(category.id, category)
					serviceTagMap.set(id, { id, tsKey, tsNs })
					service.attributes.forEach(({ attribute }) => {
						const { categories, ...rest } = attribute
						attribIds.add(rest.id)
						categories.forEach(({ category }) =>
							attributeMap.set(`${rest.id}${category.tag}`, { category, ...rest })
						)
					})
				})
			)
		})
		attributes.forEach(({ attribute }) => {
			const { categories, ...rest } = attribute
			attribIds.add(rest.id)
			categories.forEach(({ category }) =>
				attributeMap.set(`${rest.id}${category.tag}`, { category, ...rest })
			)
		})

		const desc = description
			? { key: description.key, ns: description.ns, text: description.tsKey.text }
			: null

		const serviceTags = Array.from(serviceTagMap.values())
		const serviceCategories = Array.from(serviceCategoryMap.values())
		const allAttributes = Array.from(attributeMap.values())

		const orgLeader = allAttributes.filter(({ category }) => category.tag === 'organization-leadership')
		const orgFocus = allAttributes.filter(
			({ category, _count: count }) => category.tag === 'service-focus' && count.parents === 0
		)
		const sortedCities = [
			...new Set(cities.sort(({ dist: distA }, { dist: distB }) => distA - distB).map(({ city }) => city)),
		]

		return {
			...rest,
			description: desc,
			// attributes: allAttributes,
			// services: serviceTags,
			serviceCategories,
			orgLeader,
			orgFocus,
			locations: sortedCities,
		}
	})

	return transformed
}

export type PrismaDistSearchDetailsResult = Prisma.PromiseReturnType<typeof prismaDistSearchDetails>
interface PrismaSearchDistance {
	ctx: Context
	input: DistSearch & { resultIds: string[] }
}
type IdKeyNs = {
	id: string
	tsKey: string
	tsNs: string
}
type Attribute = {
	id: string
	tsKey: string
	icon: string | null
	iconBg: string | null
	category: {
		tag: string
	}
	_count: {
		parents: number
	}
}
type City = {
	city: string
	dist: number
}
