import { Prisma } from '@prisma/client'
import invariant from 'tiny-invariant'

import { namespace as namespaces } from '~db/generated/namespaces'

import { generateId } from './idGen'
import { slug } from './slugGen'

const createKey = (parts: string[]) =>
	parts.map((part) => slug(part, { remove: /[^\w\s$*+~.()'"!\-:@]+/g })).join('.')

export const generateFreeText = ({ orgId, itemId, text, type, freeTextId }: GenerateFreeTextParams) => {
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
			id: freeTextId ?? generateId('freeText'),
		}),
	}
}
export const generateNestedFreeText = ({
	orgId: orgSlug,
	itemId,
	text,
	type,
	freeTextId,
}: GenerateFreeTextParams) => {
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
		create: { id: freeTextId, tsKey: { create: { key, text, namespace: { connect: { name: ns } } } } },
	}
}

type GenerateFreeTextParams = GenerateFreeTextWithItem | GenerateFreeTextWithoutItem

interface GenerateFreeTextBase {
	text: string
	orgId: string
	freeTextId?: string
}
interface GenerateFreeTextWithItem extends GenerateFreeTextBase {
	type: 'attSupp' | 'svcName' | 'svcDesc' | 'emailDesc' | 'phoneDesc' | 'websiteDesc'
	itemId: string
}
interface GenerateFreeTextWithoutItem extends GenerateFreeTextBase {
	type: 'orgDesc'
	itemId?: never
}
