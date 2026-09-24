import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TBadgeOptionsSchema } from './query.badgeOptions.schema'

/**
 * Attribute options for a badge category - Community Focus (`badgeType: 'service-focus'`) or Leader Badge
 * (`'organization-leadership'`) - with the same parent -> child (`AttributeNesting`) shape
 * query.suggestionOptions.handler.ts already returns for community focus, so the Community/Leader Badge
 * data-portal filters show the identical taxonomy staff see when setting these on an org. Labels use the
 * plain `name` field rather than a translated `tsKey` - the data portal is staff-only and doesn't localize.
 * Gated on `active` (a real, current attribute) rather than `activeForSuggest` (specific to the public
 * suggestion form) since this is a general-purpose filter options list, not scoped to what's still open for
 * new public suggestions.
 */
const badgeOptions = async ({ input }: TRPCHandlerParams<TBadgeOptionsSchema, 'protected'>) => {
	const attributes = await prisma.attribute.findMany({
		where: {
			categories: { some: { category: { tag: input.badgeType } } },
			parents: { none: {} },
			active: true,
		},
		select: {
			id: true,
			name: true,
			children: {
				select: {
					child: { select: { id: true, name: true } },
				},
			},
		},
		orderBy: { name: 'asc' },
	})

	return attributes.map(({ children, ...record }) => ({
		...record,
		children: children.map(({ child }) => ({ ...child, parentId: record.id })),
	}))
}

export default badgeOptions
