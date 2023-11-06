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
		}
	})()
	const ns = namespaces.orgData
	if (!key) throw new Error('Error creating key')
	return {
		translationKey: Prisma.validator<Prisma.TranslationKeyUncheckedCreateInput>()({ key, text, ns }),
		freeText: Prisma.validator<Prisma.FreeTextUncheckedCreateInput>()({
			key,
			ns,
			id: freeTextId ?? generateId('freeText'),
		}),
	}
}
export const generateNestedFreeText = <T extends GenerateFreeTextType>({
	orgId: orgSlug,
	itemId,
	text,
	type,
	freeTextId,
}: GenerateFreeTextParams<T>) => {
	const key = (() => {
		switch (type) {
			case 'orgDesc': {
				return createKey([orgSlug, 'description'])
			}
			case 'attSupp': {
				invariant(itemId)
				return createKey([orgSlug, 'attribute', itemId])
			}
			case 'svcName': {
				invariant(itemId)
				return createKey([orgSlug, itemId, 'name'])
			}
			case 'websiteDesc':
			case 'phoneDesc':
			case 'emailDesc':
			case 'svcDesc': {
				invariant(itemId)
				return createKey([orgSlug, itemId, 'description'])
			}
		}
	})()
	invariant(key)
	const ns = namespaces.orgData
	return {
		create: {
			id: freeTextId ?? generateId('freeText'),
			tsKey: { create: { key, text, namespace: { connect: { name: ns } } } },
		},
	}
}

type GenerateFreeTextParams<T extends GenerateFreeTextType> = GenerateFreeTextWithItem<T>
interface GenerateFreeTextBase {
	text: string
	orgId: string
	freeTextId?: string
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
