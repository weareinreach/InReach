import { type Simplify } from 'type-fest'

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
						tag: true,
						tsKey: true,
						tsNs: true,
						icon: true,
						iconBg: true,
						showOnLocation: true,
						categories: { select: { category: { select: { tag: true, icon: true, ns: true } } } },
						_count: { select: { parents: true, children: true } },
					},
				},
				active: true,
				countryId: true,
				country: {
					select: {
						cca2: true,
						id: true,
						name: true,
					},
				},
				data: true,
				govDistId: true,
				govDist: { select: { tsKey: true, tsNs: true, abbrev: true, id: true } },
				id: true,
				languageId: true,
				language: {
					select: {
						languageName: true,
						nativeName: true,
					},
				},
				text: { select: { tsKey: { select: { key: true, text: true, ns: true } } } },
				boolean: true,
			},
		}) as const,
	process: (data: ReturnedData) => {
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
	},
	processAndSeparateAccessDetails: (data: ReturnedData) => {
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
	},
}

type ReturnedData = {
	boolean: boolean | null
	attribute: {
		id: string
		_count: {
			children: number
			parents: number
		}
		tag: string
		tsKey: string
		tsNs: string
		categories: {
			category: {
				tag: string
				ns: string
				icon: string | null
			}
		}[]
		icon: string | null
		iconBg: string | null
		showOnLocation: boolean | null
	}
	country: {
		id: string
		name: string
		cca2: string
	} | null
	govDist: {
		id: string
		tsKey: string
		tsNs: string
		abbrev: string | null
	} | null
	language: {
		languageName: string
		nativeName: string
	} | null
	data: Prisma.JsonValue
	id: string
	active: boolean
	text: {
		tsKey: {
			key: string
			ns: string
			text: string
		}
	} | null
	govDistId: string | null
	countryId: string | null
	languageId: string | null
}[]

type DataOutput = {
	// ids
	attributeId: string
	supplementId: string
	// attribute
	category: string
	_count: {
		children: number
		parents: number
	}
	tag: string
	tsKey: string
	tsNs: string
	icon: string | null
	iconBg: string | null
	showOnLocation: boolean | null
	// supplement
	boolean: boolean | null
	country: {
		id: string
		name: string
		cca2: string
	} | null
	govDist: {
		id: string
		tsKey: string
		tsNs: string
		abbrev: string | null
	} | null
	language: {
		languageName: string
		nativeName: string
	} | null
	data: Prisma.JsonValue
	active: boolean
	govDistId: string | null
	countryId: string | null
	languageId: string | null
	text: {
		key: string
		ns: string
		text: string
	} | null
}
type ReturnSegmented = {
	attributes: Simplify<DataOutput>[]
	accessDetails: Simplify<DataOutput>[]
}
