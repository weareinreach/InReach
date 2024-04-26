import { Prisma } from '@prisma/client'
import invariant from 'tiny-invariant'

import { namespace as namespaces } from '~db/generated/namespaces'

import { generateId } from './idGen'
import { slug } from './slugGen'

const createKey = (parts: string[]) =>
	parts.map((part) => slug(part, { remove: /[^\w\s$*+~.()'"!\-:@]+/g })).join('.')

export const generateFreeText = <T extends GenerateFreeTextType>({
	orgId,
	itemId,
	text,
	type,
	freeTextId,
}: GenerateFreeTextParams<T>) => {
	const key = (() => {
		switch (type) {
			case 'orgDesc': {
				return createKey([orgId, 'description'])
			}
			case 'attSupp': {
				invariant(itemId)
				return createKey([orgId, 'attribute', itemId])
			}
			case 'svcName': {
				invariant(itemId)
				return createKey([orgId, itemId, 'name'])
			}
			case 'websiteDesc':
			case 'phoneDesc':
			case 'emailDesc':
			case 'svcDesc': {
				invariant(itemId)
				return createKey([orgId, itemId, 'description'])
			}
			default: {
				return null
			}
		}
	})()
	const ns = namespaces.orgData
	invariant(key, 'Error creating key')
	return {
		translationKey: Prisma.validator<Prisma.TranslationKeyUncheckedCreateInput>()({ key, text, ns }),
		freeText: Prisma.validator<Prisma.FreeTextUncheckedCreateInput>()({
			key,
			ns,
			id: freeTextId ?? generateId('freeText'),
		}),
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

type GenerateFreeTextParams<T extends GenerateFreeTextType> = GenerateFreeTextWithItem<T>
interface GenerateFreeTextBase {
	text: string
	orgId: string
	freeTextId?: string | null
}

type GenerateFreeTextType =
	| 'attSupp'
	| 'svcName'
	| 'svcDesc'
	| 'emailDesc'
	| 'phoneDesc'
	| 'websiteDesc'
	| 'orgDesc'

interface GenerateFreeTextWithItem<T extends GenerateFreeTextType> extends GenerateFreeTextBase {
	type: T
	itemId?: GenerateFreeTextItemId<T>
}
type GenerateFreeTextItemId<T extends GenerateFreeTextType> = T extends 'orgDesc' ? never : Required<string>
// interface GenerateFreeTextWithoutItem extends GenerateFreeTextBase {
// 	type: 'orgDesc'
// 	itemId?: never
// }
