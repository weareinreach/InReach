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
	.optional()
	.transform((data) => {
		if (!data) return []
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

			return {
				id,
				name,
				slug,
				description,
				attributes: attributes.flatMap(({ attribute }) =>
					attribute.categories.map(({ attribute }) => attribute)
				),
				services: Array.from(servCombined).map((item) => JSON.parse(item) as ServCat),
			}
		})
		return result
	})

type ServCat = {
	id: string
	tsKey: string
	tsNs: string
}
