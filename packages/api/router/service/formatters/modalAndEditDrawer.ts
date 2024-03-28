import { type TOptions } from 'i18next'
import { type z } from 'zod'

import { type Prisma, prisma } from '@weareinreach/db'
import { attributeSupplementSchema } from '@weareinreach/db/generated/attributeSupplementSchema'
import { accessInstructions } from '@weareinreach/db/zod_util/attributeSupplement'
import { globalWhere } from '~api/selects/global'

const getFreeText = (freeTextRecord: NonNullable<ReturnedData['attributes'][number]['text']>) => {
	const { tsKey } = freeTextRecord
	const { key: dbKey } = tsKey
	const deconstructedKey = dbKey.split('.')
	const ns = deconstructedKey[0]
	if (!deconstructedKey.length || !ns) throw new Error('Invalid key')
	const key = deconstructedKey.join('.')
	const options = { ns, defaultValue: tsKey.text } satisfies TOptions
	return { key, options }
}
export const attributeSelect = (showAll?: boolean) =>
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
					categories: { select: { category: { select: { tag: true, ns: true } } } },
					_count: {
						select: {
							parents: true,
							children: true,
						},
					},
				},
			},
			active: true,
			countryId: true,
			data: true,
			govDistId: true,
			id: true,
			language: { select: { id: true, languageName: true } },
			languageId: true,
			text: { select: { tsKey: { select: { key: true, text: true, ns: true } } } },
			boolean: true,
		},
	}) as const
export const locationSelect = (showAll?: boolean) =>
	({
		...(showAll
			? {}
			: ({
					where: {
						location: globalWhere.isPublic(),
					},
				} as const)),
		select: { location: { select: { country: { select: { cca2: true } } } } },
	}) as const

export const transformToProps = (data: ReturnedData): TransformOutput => {
	const { attributes, locations } = data
	const output: TransformOutput = {
		accessInstructions: {
			publicTransit: undefined,
			email: [],
			phone: [],
			website: [],
		},
		attributeSections: {
			clientsServed: {
				focused: [],
				targetPopulation: [],
			},
			eligibility: {
				age: undefined,
			},
			cost: {
				description: [],
				badged: [],
			},
			language: [],
			atCapacity: false,
			misc: [],
			miscWithIcons: [],
		},
	}
	type AttributeToProcess = (typeof attributes)[number]['attribute']
	type SupplementToProcess = Omit<(typeof attributes)[number], 'attribute'>
	const processAccessInstruction = (
		data: z.infer<ReturnType<typeof accessInstructions.getAll>>,
		supplement: SupplementToProcess
	) => {
		const { access_type, access_value } = data
		switch (access_type) {
			case 'publicTransit': {
				if (!supplement.text) break
				output.accessInstructions.publicTransit = {
					key: supplement.id,
					children: getFreeText(supplement.text),
				}
				break
			}
			case 'email': {
				if (access_value)
					output.accessInstructions.email.push({
						id: supplement.id,
						title: null,
						description: null,
						email: access_value,
						primary: false,
						locationOnly: false,
						serviceOnly: false,
					})
				break
			}
			case 'phone': {
				const country = locations.find(({ location }) => Boolean(location.country))?.location?.country?.cca2
				if (!country) break
				if (access_value)
					output.accessInstructions.phone.push({
						id: supplement.id,
						number: access_value,
						phoneType: null,
						country,
						primary: false,
						locationOnly: false,
						ext: null,
						description: null,
					})
				break
			}
			case 'link':
			case 'file': {
				if (access_value)
					output.accessInstructions.website.push({
						id: supplement.id,
						description: null,
						isPrimary: false,
						orgLocationOnly: false,
						url: access_value,
					})
			}
		}
	}

	const handleSrvFocus = (attribute: AttributeToProcess, supplement: SupplementToProcess) => {
		if (typeof attribute.icon === 'string' && attribute._count.parents === 0) {
			output.attributeSections.clientsServed.focused.push({
				key: supplement.id,
				icon: attribute.icon,
				children: {
					tsKey: attribute.tsKey,
					tOptions: { ns: attribute.tsNs },
				},
			})
		}
	}
	const handleEligibility = (attribute: AttributeToProcess, supplement: SupplementToProcess) => {
		const type = attribute.tsKey.split('.').pop() as string
		switch (type) {
			case 'elig-age': {
				const parsed = attributeSupplementSchema.numMinMaxOrRange.safeParse(supplement.data)
				if (!parsed.success) break
				const { min, max } = parsed.data
				const context = (function () {
					switch (true) {
						case Boolean(min) && Boolean(max): {
							return 'range'
						}
						case Boolean(min): {
							return 'min'
						}
						default: {
							return 'max'
						}
					}
				})()

				output.attributeSections.eligibility.age = {
					key: supplement.id,
					children: {
						key: 'service.elig-age',
						options: { ns: 'common', context, min, max },
					},
				}

				break
			}
			case 'other-describe': {
				if (!supplement.text) break
				output.attributeSections.clientsServed.targetPopulation.push({
					key: supplement.id,
					children: getFreeText(supplement.text),
				})
				break
			}
		}
	}
	const handleCost = (attribute: AttributeToProcess, supplement: SupplementToProcess) => {
		if (!attribute.icon) return
		if (supplement.text) {
			output.attributeSections.cost.description.push({
				key: supplement.id,
				children: getFreeText(supplement.text),
			})
		}
		const parsed = attributeSupplementSchema.currency.safeParse(supplement.data)
		if (parsed.success) {
			output.attributeSections.cost.badged.push({
				key: supplement.id,
				icon: attribute.icon,
				style: { justifyContent: 'start' },
				children: {
					tsKey: attribute.tsKey,
					tOptions: { ns: attribute.tsNs },
					miscInterpolation: {
						data: parsed.data.cost,
						currency: parsed.data.currency ?? undefined,
						style: 'currency',
					},
				},
			})
		}
	}
	const handleLanguage = (attribute: AttributeToProcess, supplement: SupplementToProcess) => {
		if (!supplement.language) return
		output.attributeSections.language.push(supplement.language.languageName)
	}
	const handleAdditional = (attribute: AttributeToProcess, supplement: SupplementToProcess) => {
		if (attribute.tsKey.includes('at-capacity')) output.attributeSections.atCapacity = true
		else {
			typeof attribute.icon === 'string'
				? output.attributeSections.miscWithIcons.push({
						key: supplement.id,
						icon: attribute.icon,
						children: {
							tsKey: attribute.tsKey,
							tOptions: { ns: attribute.tsNs },
						},
					})
				: output.attributeSections.misc.push({
						tsKey: attribute.tsKey,
						tOptions: { ns: attribute.tsNs },
					})
		}
	}
	const processAttribute = (attribute: AttributeToProcess, supplement: SupplementToProcess) => {
		const namespace = attribute.tsKey.split('.').shift() as string

		switch (namespace) {
			/** Clients served */
			case 'srvfocus': {
				handleSrvFocus(attribute, supplement)
				break
			}
			/** Target Population & Eligibility Requirements */
			case 'eligibility': {
				handleEligibility(attribute, supplement)
				break
			}
			case 'cost': {
				handleCost(attribute, supplement)
				break
			}

			case 'lang': {
				handleLanguage(attribute, supplement)
				break
			}
			case 'additional': {
				handleAdditional(attribute, supplement)
				break
			}
			default: {
				break
			}
		}
	}

	for (const { attribute, ...supplement } of attributes) {
		const flatAttribs = attribute.categories.map(({ category }) => category.tag)
		if (flatAttribs.includes('service-access-instructions')) {
			// process access instruction
			const parsed = accessInstructions.getAll().safeParse(supplement.data)
			if (parsed.success) {
				processAccessInstruction(parsed.data, supplement)
			}
		} else {
			// process attribute
			processAttribute(attribute, supplement)
		}
	}
	return output
}

const testTxn = async () =>
	await prisma.orgService.findFirstOrThrow({
		where: { id: '' },
		select: { attributes: attributeSelect(), locations: locationSelect() },
	})
type ReturnedData = Prisma.PromiseReturnType<typeof testTxn>
type TransformOutput = {
	accessInstructions: {
		publicTransit?: ModalTextProps
		email: EmailProps[]
		phone: PhoneProps[]
		website: WebsiteProps[]
	}
	attributeSections: {
		clientsServed: {
			focused: AttributeBadgeProps[]
			targetPopulation: ModalTextProps[]
		}
		eligibility: {
			age?: ModalTextProps
		}
		cost: {
			badged: AttributeBadgeProps[]
			description: ModalTextProps[]
		}
		language: string[]
		atCapacity: boolean
		miscWithIcons: AttributeBadgeProps[]
		misc: ChildrenT[]
	}
}
type ModalTextProps = {
	key: string
	children: {
		key: string
		options: TOptions
	}
}
type EmailProps = {
	id: string
	title: null
	description: null
	email: string
	primary: boolean
	locationOnly: boolean
	serviceOnly: boolean
}
type PhoneProps = {
	id: string
	number: string
	phoneType: null
	country: string
	primary: boolean
	locationOnly: boolean
	ext: null
	description: null
}
type WebsiteProps = {
	id: string
	description: null
	isPrimary: false
	orgLocationOnly: boolean
	url: string
}
type AttributeBadgeProps = {
	key: string
	icon: string
	children: ChildrenT
	style?: Record<string, unknown>
}
type ChildrenT = {
	tsKey: string
	tOptions: TOptions
	miscInterpolation?: InterpolateNumber
}
type InterpolateNumber = Intl.NumberFormatOptions & { data: number }
