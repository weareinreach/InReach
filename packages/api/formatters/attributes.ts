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
				active: true,
				countryId: true,
				data: true,
				govDistId: true,
				id: true,
				languageId: true,
				text: { select: { tsKey: { select: { key: true, text: true, ns: true } } } },
				boolean: true,
			},
		}) as const,
	process: (data: ReturnedData, separateAccessDetails?: boolean) => {
		if (!separateAccessDetails) {
			const flat = data.flatMap(({ attribute, ...supplement }) => {
				const { categories, ...rest } = attribute
				const flatAttribs = categories.map(({ category }) => ({ ...rest, category: category.tag }))
				const { id: supplementId, text, ...supp } = supplement
				return flatAttribs.map(({ id: attributeId, ...attrib }) => ({
					attributeId,
					supplementId,
					...attrib,
					...supp,
					text: text?.tsKey ?? null,
				}))
			})
			return flat
		} else {
			const output: ReturnSegmented = {
				attributes: [],
				accessDetails: [],
			}
			for (const { attribute, ...supplement } of data) {
				const { categories, ...rest } = attribute
				const flatAttribs = categories.map(({ category }) => ({ ...rest, category: category.tag }))
				const { id: supplementId, text, ...supp } = supplement
				for (const { id: attributeId, ...attrib } of flatAttribs) {
					if (attrib.category === 'service-access-instructions') {
						output.accessDetails.push({
							attributeId,
							supplementId,
							...attrib,
							...supp,
							text: text?.tsKey ?? null,
						})
					} else {
						output.attributes.push({
							attributeId,
							supplementId,
							...attrib,
							...supp,
							text: text?.tsKey ?? null,
						})
					}
				}
			}
			return output
		}
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

type DataOutput = {
	text: {
		key: string
		text: string
		ns: string
	} | null
	boolean: boolean | null
	data: Prisma.JsonValue
	active: boolean
	countryId: string | null
	govDistId: string | null
	languageId: string | null
	category: string
	attributeId: string
	supplementId: string
}
type ReturnSegmented = {
	attributes: DataOutput[]
	accessDetails: DataOutput[]
}
