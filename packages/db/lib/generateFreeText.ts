import { Prisma } from '@prisma/client'
import invariant from 'tiny-invariant'

import { generateId } from './idGen'
import { slug } from './slugGen'

import { namespaces } from '~db/seed/data/00-namespaces'

const createKey = (parts: string[]) => slug(parts.join('.'))

export const generateFreeText = ({ orgSlug, itemId, text, type }: GenerateFreeTextParams) => {
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
			case 'phoneDesc':
			case 'emailDesc':
			case 'svcDesc': {
				invariant(itemId)
				return createKey([orgSlug, itemId, 'description'])
			}
		}
	})()
	const ns = namespaces.orgData
	return {
		translationKey: Prisma.validator<Prisma.TranslationKeyUncheckedCreateInput>()({ key, text, ns }),
		freeText: Prisma.validator<Prisma.FreeTextUncheckedCreateInput>()({
			key,
			ns,
			id: generateId('freeText'),
		}),
	}
}
export const generateNestedFreeText = ({ orgSlug, itemId, text, type }: GenerateFreeTextParams) => {
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
			case 'phoneDesc':
			case 'emailDesc':
			case 'svcDesc': {
				invariant(itemId)
				return createKey([orgSlug, itemId, 'description'])
			}
		}
	})()
	const ns = namespaces.orgData
	return {
		create: { tsKey: { create: { key, text, namespace: { connect: { name: ns } } } } },
	}
}

type GenerateFreeTextParams = GenerateFreeTextWithItem | GenerateFreeTextWithoutItem

interface GenerateFreeTextBase {
	text: string
	orgSlug: string
}
interface GenerateFreeTextWithItem extends GenerateFreeTextBase {
	type: 'attSupp' | 'svcName' | 'svcDesc' | 'emailDesc' | 'phoneDesc'
	itemId: string
}
interface GenerateFreeTextWithoutItem extends GenerateFreeTextBase {
	type: 'orgDesc'
	itemId?: never
}
