import { Prisma } from '@prisma/client'
import invariant from 'tiny-invariant'

import { namespaces } from '~db/seed/data/00-namespaces'

import { generateId } from './idGen'
import { slug } from './slugGen'

const createKey = (parts: string[]) => slug(parts.join('.'))

export const generateFreeText = ({ orgId, itemId, text, type }: GenerateFreeTextParams) => {
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
	return {
		translationKey: Prisma.validator<Prisma.TranslationKeyUncheckedCreateInput>()({ key, text, ns }),
		freeText: Prisma.validator<Prisma.FreeTextUncheckedCreateInput>()({
			key,
			ns,
			id: generateId('freeText'),
		}),
	}
}
export const generateNestedFreeText = ({ orgId: orgSlug, itemId, text, type }: GenerateFreeTextParams) => {
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
	const ns = namespaces.orgData
	return {
		create: { tsKey: { create: { key, text, namespace: { connect: { name: ns } } } } },
	}
}

type GenerateFreeTextParams = GenerateFreeTextWithItem | GenerateFreeTextWithoutItem

interface GenerateFreeTextBase {
	text: string
	orgId: string
}
interface GenerateFreeTextWithItem extends GenerateFreeTextBase {
	type: 'attSupp' | 'svcName' | 'svcDesc' | 'emailDesc' | 'phoneDesc' | 'websiteDesc'
	itemId: string
}
interface GenerateFreeTextWithoutItem extends GenerateFreeTextBase {
	type: 'orgDesc'
	itemId?: never
}
