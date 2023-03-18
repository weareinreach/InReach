import { z } from 'zod'

export const SearchDetailsOutput = z
	.object({
		id: z.string(),
		name: z.string(),
		slug: z.string(),
		distance: z.number(), // injected
		unit: z.enum(['km', 'mi']), // injected
		attributes: z
			.object({
				attribute: z.object({
					categories: z
						.object({
							attribute: z.object({
								tsKey: z.string(),
								icon: z.string().nullable(),
								iconBg: z.string().nullable(),
							}),
							category: z.object({
								tag: z.string(),
							}),
						})
						.array(),
				}),
			})
			.array(),
		description: z
			.object({
				key: z.string(),
				ns: z.string(),
				tsKey: z.object({ text: z.string() }),
			})
			.nullable(),
		services: z
			.object({
				services: z
					.object({
						tag: z.object({
							category: z.object({
								id: z.string(),
								tsKey: z.string(),
								tsNs: z.string(),
							}),
						}),
					})
					.array(),
			})
			.array(),
		locations: z
			.object({
				city: z.string(),
				services: z
					.object({
						service: z.object({
							services: z
								.object({
									tag: z.object({
										category: z.object({
											id: z.string(),
											tsKey: z.string(),
											tsNs: z.string(),
										}),
									}),
								})
								.array(),
						}),
					})
					.array(),
			})
			.array(),
	})
	.array()
	.transform((data) => {
		const result = data.map(({ attributes, description, locations, services, ...rest }) => {
			const servCombined = new Set<string>()

			services.forEach(({ services }) =>
				services.forEach(({ tag }) => servCombined.add(JSON.stringify(tag.category)))
			)
			const locationCities: string[] = []
			locations.forEach(({ services, city }) => {
				locationCities.push(city)
				services.forEach(({ service }) =>
					service.services.forEach(({ tag }) => servCombined.add(JSON.stringify(tag.category)))
				)
			})
			const desc = description
				? { key: description.key, ns: description.ns, text: description.tsKey.text }
				: null

			const flatAttributes = attributes.map(({ attribute }) => attribute)
			const orgLeader = flatAttributes
				.filter(({ categories }) =>
					categories.some(({ category }) => category.tag === 'organization-leadership')
				)
				.flatMap(({ categories }) => categories.map(({ attribute }) => attribute))
			const orgFocus = flatAttributes
				.filter(({ categories }) => categories.some(({ category }) => category.tag === 'organization-focus'))
				.flatMap(({ categories }) => categories.map(({ attribute }) => attribute))

			return {
				...rest,
				description: desc,
				attributes: { orgLeader, orgFocus },
				services: Array.from(servCombined).map((item) => JSON.parse(item) as ServCat),
				locations: locationCities,
			}
		})
		return result
	}) satisfies z.ZodType<any, any, SearchReturn>

type ServCat = {
	id: string
	tsKey: string
	tsNs: string
}

type SearchReturn = {
	id: string
	name: string
	slug: string
	distance: number
	unit: 'km' | 'mi'
	attributes: {
		attribute: {
			categories: {
				attribute: {
					tsKey: string
					icon: string | null
					iconBg: string | null
				}
				category: {
					tag: string
				}
			}[]
		}
	}[]
	description: {
		key: string
		ns: string
	} | null
	services: {
		services: {
			tag: {
				category: {
					id: string
					tsNs: string
					tsKey: string
				}
			}
		}[]
	}[]
	locations: {
		city: string
		services: {
			service: {
				services: {
					tag: {
						category: {
							id: string
							tsNs: string
							tsKey: string
						}
					}
				}[]
			}
		}[]
	}[]
}[]
