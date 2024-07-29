import Ajv, { type JSONSchemaType } from 'ajv'

import { prisma } from '@weareinreach/db'
import { type FieldAttributes } from '@weareinreach/db/zod_util/attributeSupplement'
import { type TRPCHandlerParams } from '~api/types/handler'

import { fieldAttributesSchema, type TAttributesByCategorySchema } from './query.attributesByCategory.schema'

const ajv = new Ajv()
const validateJsonSchema = (schema: unknown): schema is JSONSchemaType<unknown> => {
	if (schema && typeof schema === 'object' && ajv.validateSchema(schema)) {
		return true
	}
	return false
}

const attributesByCategory = async ({ input }: TRPCHandlerParams<TAttributesByCategorySchema>) => {
	const { attributeActive, categoryActive } = input ?? { attributeActive: true, categoryActive: true }

	const result = await prisma.attributesByCategory.findMany({
		where: {
			categoryName: Array.isArray(input?.categoryName) ? { in: input.categoryName } : input?.categoryName,
			canAttachTo: input?.canAttachTo?.length ? { hasSome: input.canAttachTo } : undefined,
			attributeActive: attributeActive ? attributeActive : undefined,
			categoryActive: categoryActive ? categoryActive : undefined,
		},
		orderBy: [{ categoryName: 'asc' }, { attributeName: 'asc' }],
	})

	const flushedResults = result.map((item) => {
		const { formSchema, dataSchema, ...rest } = item

		const parsedFormSchema = fieldAttributesSchema.safeParse(formSchema)
		const parsedDataSchema = validateJsonSchema(dataSchema) ? dataSchema : null

		return {
			...rest,
			formSchema: parsedFormSchema.success
				? (parsedFormSchema.data as FieldAttributes[] | FieldAttributes[][])
				: null,
			dataSchema: parsedDataSchema,
		}
	})
	return flushedResults
}
export default attributesByCategory
