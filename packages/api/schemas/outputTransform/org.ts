import { z } from 'zod'

export const SearchDetailsOutput = z
	.object({
		id: z.string(),
		name: z.string(),
		slug: z.string(),
		attributes: z
			.object({
				attribute: z.object({
					categories: z
						.object({
							attribute: z.object({
								tsNs: z.string(),
								tsKey: z.string(),
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
		const result = data.map(({ id, name, attributes, description, locations, services, slug }) => {
			const servCombined = new Set<string>()

			services.forEach(({ services }) =>
				services.forEach(({ tag }) => servCombined.add(JSON.stringify(tag.category)))
			)

			locations.forEach(({ services }) =>
				services.forEach(({ service }) =>
					service.services.forEach(({ tag }) => servCombined.add(JSON.stringify(tag.category)))
				)
			)
			const desc = description
				? { key: description.key, ns: description.ns, text: description.tsKey.text }
				: null

			return {
				id,
				name,
				slug,
				description: desc,
				attributes: attributes.flatMap(({ attribute }) =>
					attribute.categories.map(({ attribute }) => attribute)
				),
				services: Array.from(servCombined).map((item) => JSON.parse(item) as ServCat),
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
	attributes: {
		attribute: {
			categories: {
				attribute: {
					tsNs: string
					tsKey: string
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
