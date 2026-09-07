import { prisma } from '@weareinreach/db'
import { type FieldAttributes } from '@weareinreach/db/zod_util/attributeSupplement'
import { fieldAttributesSchema } from '~api/router/fieldOpt/query.attributesByCategory.schema'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAttributeEditWrapperDetailSchema } from './query.AttributeEditWrapperDetail.schema'

const attributeEditWrapperDetail = async ({
	input,
}: TRPCHandlerParams<TAttributeEditWrapperDetailSchema>) => {
	const { id } = input
	const supplement = await prisma.attributeSupplement.findUniqueOrThrow({
		where: { id },
		select: {
			attributeId: true,
			boolean: true,
			data: true,
			countryId: true,
			govDistId: true,
			languageId: true,
			text: { select: { tsKey: { select: { text: true } } } },
		},
	})

	// Attribute definitions (which fields render, and the JSON-schema-driven `formSchema`) live on this
	// view, keyed one row per (category, attribute) pair - any row for this attributeId carries the same
	// definition data regardless of which category it came in through.
	const definition = await prisma.attributesByCategory.findFirstOrThrow({
		where: { attributeId: supplement.attributeId },
		select: {
			attributeId: true,
			attributeKey: true,
			dataSchemaName: true,
			formSchema: true,
			requireBoolean: true,
			requireData: true,
			requireGeo: true,
			requireLanguage: true,
			requireText: true,
		},
	})

	const parsedFormSchema = fieldAttributesSchema.safeParse(definition.formSchema)

	return {
		...definition,
		formSchema: parsedFormSchema.success
			? (parsedFormSchema.data as FieldAttributes[] | FieldAttributes[][])
			: null,
		boolean: supplement.boolean,
		data: supplement.data,
		countryId: supplement.countryId,
		govDistId: supplement.govDistId,
		languageId: supplement.languageId,
		text: supplement.text?.tsKey.text ?? null,
	}
}
export default attributeEditWrapperDetail
