import { prisma } from '@weareinreach/db'
import { type FieldAttributes } from '@weareinreach/db/zod_util/attributeSupplement'
import { type TRPCHandlerParams } from '~api/types/handler'

import { fieldAttributesSchema, type TAttributesByCategorySchema } from './query.attributesByCategory.schema'

export const attributesByCategory = async ({ input }: TRPCHandlerParams<TAttributesByCategorySchema>) => {
	console.log(input)
	const result = await prisma.attributesByCategory.findMany({
		where: {
			categoryName: Array.isArray(input?.categoryName) ? { in: input.categoryName } : input?.categoryName,
			canAttachTo: input?.canAttachTo?.length ? { hasSome: input.canAttachTo } : undefined,
		},
		orderBy: [{ categoryName: 'asc' }, { attributeName: 'asc' }],
	})

	const flushedResults = result.map((item) => {
		const { dataSchema, ...rest } = item

		const parsedDataSchema = fieldAttributesSchema.safeParse(dataSchema)

		return {
			...rest,
			dataSchema: parsedDataSchema.success
				? (parsedDataSchema.data as FieldAttributes[] | FieldAttributes[][])
				: null,
		}
	})
	return flushedResults
}
