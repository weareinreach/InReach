import { Prisma } from '@prisma/client'
import invariant from 'tiny-invariant'

import { namespace as namespaces } from '~db/generated/namespaces'

import { generateId } from './idGen'
import { slug } from './slugGen'

const createKey = (parts: string[]) =>
	parts.map((part) => slug(part, { remove: /[^\w\s$*+~.()'"!\-:@]+/g })).join('.')

export const generateFreeText = <T extends GenerateFreeTextType>(args: GenerateFreeTextParams<T>) => {
	const { text, type, freeTextId } = args
	const key = (() => {
		switch (type) {
			case 'orgDesc': {
				const { orgId } = args as GenerateFreeTextParams<'orgDesc'>
				invariant(orgId)
				return createKey([orgId, 'description'])
			}
			case 'attSupp': {
				const { orgId, itemId } = args as GenerateFreeTextParams<'attSupp'>
				invariant(itemId && orgId)
				return createKey([orgId, 'attribute', itemId])
			}
			case 'svcName': {
				const { orgId, itemId } = args as GenerateFreeTextParams<'svcName'>
				invariant(itemId && orgId)
				return createKey([orgId, itemId, 'name'])
			}
			case 'websiteDesc':
			case 'phoneDesc':
			case 'emailDesc':
			case 'svcDesc': {
				const { orgId, itemId } = args as GenerateFreeTextParams<
					'websiteDesc' | 'phoneDesc' | 'emailDesc' | 'svcDesc'
				>
				invariant(itemId && orgId)
				return createKey([orgId, itemId, 'description'])
			}
			case 'locationAlert': {
				const { itemId } = args as GenerateFreeTextParams<'locationAlert'>
				invariant(itemId)
				return createKey(['locationBasedAlert', itemId])
			}
			default: {
				return null
			}
		}
	})()
	const ns = namespaces.orgData
	invariant(key, 'Error creating key')
	return {
		translationKey: Prisma.validator<Prisma.TranslationKeyUncheckedCreateInput>()({
			key,
			text,
			ns,
		}),
		freeText: Prisma.validator<Prisma.FreeTextUncheckedCreateInput>()({
			key,
			ns,
			id: freeTextId ?? generateId('freeText'),
		}),
	}
}

interface GenerateFreeTextReturn {
	translationKey: {
		key: string
		text: string
		ns: string
		crowdinId?: number
	}
	freeText: {
		key: string
		ns: string
		id: string
	}
}
export const generateNestedFreeText = <T extends GenerateFreeTextType>(
	args: GenerateFreeTextParams<T>
): NestedCreateOne => {
	const { freeText, translationKey } = generateFreeText(args)
	return {
		create: {
			id: freeText.id,
			tsKey: {
				create: {
					key: translationKey.key,
					text: translationKey.text,
					namespace: { connect: { name: translationKey.ns } },
				},
			},
		},
	}
}

interface NestedCreateOne {
	create: {
		id: string
		tsKey: {
			create: {
				key: string
				text: string
				crowdinId?: number
				namespace: {
					connect: {
						name: string
					}
				}
			}
		}
	}
}

export const generateNestedFreeTextUpsert = <T extends GenerateFreeTextType>(
	args: GenerateFreeTextParams<T>
): GenerateNestedFreeTextUpsertResult => {
	const { freeText, translationKey } = generateFreeText(args)
	return {
		upsert: {
			create: {
				id: freeText.id,
				tsKey: {
					create: {
						key: translationKey.key,
						text: translationKey.text,
						namespace: { connect: { name: translationKey.ns } },
					},
				},
			},
			update: {
				tsKey: {
					update: { text: translationKey.text },
				},
			},
		},
	}
}
interface GenerateNestedFreeTextUpsertResult {
	upsert: {
		create: {
			id: string
			tsKey: {
				create: {
					key: string
					text: string
					crowdinId?: number
					namespace: { connect: { name: string } }
				}
			}
		}
		update: { tsKey: { update: { text: string } } }
	}
}

type GenerateFreeTextParams<T extends GenerateFreeTextType> = {
	type: T
	text: string
	freeTextId?: string | null
	// eslint-disable-next-line @typescript-eslint/ban-types
} & (T extends 'locationAlert' ? {} : { orgId: string }) &
	// eslint-disable-next-line @typescript-eslint/ban-types
	(T extends 'orgDesc' ? {} : { itemId: string })

type GenerateFreeTextType =
	| 'attSupp'
	| 'svcName'
	| 'svcDesc'
	| 'emailDesc'
	| 'phoneDesc'
	| 'websiteDesc'
	| 'orgDesc'
	| 'locationAlert'
