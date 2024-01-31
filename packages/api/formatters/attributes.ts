import { type Prisma } from '@weareinreach/db'

export const formatAttributes = {
	prismaSelect: (showAll?: boolean) =>
		({
			...(showAll
				? {}
				: ({
						where: {
							active: true,
							attribute: { active: true },
						},
					} as const)),
			select: {
				attribute: {
					select: {
						id: true,
						// tsKey: true,
						// tsNs: true,
						// icon: true,
						// iconBg: true,
						categories: { select: { category: { select: { tag: true, ns: true } } } },
					},
				},
				supplement: {
					...(showAll ? {} : { where: { active: true } }),
					select: {
						active: true,
						countryId: true,
						data: true,
						govDistId: true,
						id: true,
						languageId: true,
						text: { select: { tsKey: { select: { key: true, text: true, ns: true } } } },
						boolean: true,
					},
				},
			},
		}) as const,
	process: (data: ReturnedData) => {
		const flat = data.flatMap(({ attribute, supplement }) => {
			const { categories, ...rest } = attribute
			const flatAttribs = categories.map(({ category }) => ({ ...rest, category: category.tag }))
			return supplement.flatMap(({ id: supplementId, text, ...supp }) =>
				flatAttribs.map(({ id: attributeId, ...attrib }) => ({
					attributeId,
					supplementId,
					...attrib,
					...supp,
					text: text?.tsKey ?? null,
				}))
			)
		})
		return flat
	},
}

type ReturnedData = {
	attribute: {
		id: string
		// tsKey: string
		// tsNs: string
		categories: {
			category: {
				tag: string
				ns: string
			}
		}[]
		// icon: string | null
		// iconBg: string | null
	}
	supplement: {
		boolean: boolean | null
		id: string
		data: Prisma.JsonValue
		active: boolean
		text: {
			tsKey: {
				key: string
				text: string
				ns: string
			}
		} | null
		countryId: string | null
		govDistId: string | null
		languageId: string | null
	}[]
}[]
