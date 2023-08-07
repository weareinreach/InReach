import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAttributeCategoriesSchema } from './query.attributeCategories.schema'

export const attributeCategories = async ({ ctx, input }: TRPCHandlerParams<TAttributeCategoriesSchema>) => {
	try {
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
	} catch (error) {
		handleError(error)
	}
}
