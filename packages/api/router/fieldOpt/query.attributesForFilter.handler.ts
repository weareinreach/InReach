import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAttributesForFilterSchema } from './query.attributesForFilter.schema'

/**
 * Attribute options grouped by category, for the data portal's untranslated quick filters - unlike
 * `attributesByCategory` (backed by the `attributes_by_category` view), this selects the real
 * `Attribute.name`/`AttributeCategory.name` columns directly rather than the view's `attributeName` (actually
 * `Attribute.tag`, a dotted slug like "eligibility.req-photo-id") and `categoryName` (similarly the raw
 * category tag) fields, which only look right once run through translation.
 */
const attributesForFilter = async ({ input }: TRPCHandlerParams<TAttributesForFilterSchema, 'protected'>) => {
	const attributes = await prisma.attribute.findMany({
		where: {
			active: true,
			canAttachTo: input.canAttachTo?.length ? { hasSome: input.canAttachTo } : undefined,
			categories: { some: { category: { active: true } } },
		},
		select: {
			id: true,
			name: true,
			categories: {
				select: { category: { select: { id: true, name: true } } },
			},
		},
		orderBy: { name: 'asc' },
	})

	// An attribute can belong to more than one category - one row per (attribute, category) pairing, same
	// shape as the `attributes_by_category` view, so it groups the same way.
	return attributes.flatMap((attribute) =>
		attribute.categories.map(({ category }) => ({
			categoryId: category.id,
			categoryName: category.name,
			attributeId: attribute.id,
			attributeName: attribute.name,
		}))
	)
}

export default attributesForFilter
