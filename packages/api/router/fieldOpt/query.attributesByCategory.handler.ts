import flush from 'just-flush'
import { type SetOptional } from 'type-fest'

import { prisma } from '@weareinreach/db'
import { type AttributesByCategory } from '@weareinreach/db/client'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAttributesByCategorySchema } from './query.attributesByCategory.schema'

export const attributesByCategory = async ({ input }: TRPCHandlerParams<TAttributesByCategorySchema>) => {
	const where = Array.isArray(input)
		? { categoryName: { in: input } }
		: typeof input === 'string'
		? { categoryName: input }
		: undefined
	const result = await prisma.attributesByCategory.findMany({
		where,
		orderBy: [{ categoryName: 'asc' }, { attributeName: 'asc' }],
	})

	const flushedResults = result.map((item) =>
		flush<FlushedAttributesByCategory>(item)
	) as FlushedAttributesByCategory[]
	return flushedResults
}
type FlushedAttributesByCategory = SetOptional<
	AttributesByCategory,
	'interpolationValues' | 'icon' | 'iconBg' | 'badgeRender' | 'dataSchema' | 'dataSchemaName'
>
