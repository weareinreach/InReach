import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAttributeCategoriesSchema } from './query.attributeCategories.schema'

const attributeCategories = async ({ input }: TRPCHandlerParams<TAttributeCategoriesSchema>) => {
	const results = await prisma.attributeCategory.findMany({
		where: { active: true, ...(input?.length ? { tag: { in: input } } : {}) },
		select: {
			id: true,
			tag: true,
			name: true,
			icon: true,
			intDesc: true,
		},
		orderBy: { tag: 'asc' },
	})
	return results
}
export default attributeCategories
