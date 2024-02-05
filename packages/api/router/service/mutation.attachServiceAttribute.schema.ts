import { z } from 'zod'

import { generateFreeText, generateId, InputJsonValue, Prisma } from '@weareinreach/db'

export const ZAttachServiceAttributeSchema = z
	.object({
		orgId: z.string(),
		orgServiceId: z.string(),
		attributeId: z.string(),
		supplement: z
			.object({
				data: InputJsonValue.optional(),
				boolean: z.boolean().optional(),
				countryId: z.string().optional(),
				govDistId: z.string().optional(),
				languageId: z.string().optional(),
				text: z.string().optional(),
			})
			.optional(),
	})
	.transform((parsedData) => {
		const { orgId, orgServiceId, attributeId, supplement: supplementInput } = parsedData

		const supplementId = generateId('attributeSupplement')

		const { freeText, translationKey } =
			supplementId && supplementInput?.text
				? generateFreeText({ orgId, text: supplementInput.text, type: 'attSupp', itemId: supplementId })
				: { freeText: undefined, translationKey: undefined }

		const { boolean, countryId, data, govDistId, languageId } = supplementInput ?? {}

		const supplementData = {
			id: supplementId,
			attributeId,
			serviceId: orgServiceId,
			countryId,
			boolean,
			data,
			govDistId,
			languageId,
			textId: freeText?.id,
		}

		return {
			freeText: freeText ? Prisma.validator<Prisma.FreeTextCreateArgs>()({ data: freeText }) : undefined,
			translationKey: translationKey
				? Prisma.validator<Prisma.TranslationKeyCreateArgs>()({ data: translationKey })
				: undefined,
			attributeSupplement: supplementData
				? Prisma.validator<Prisma.AttributeSupplementCreateArgs>()({
						data: supplementData,
					})
				: undefined,
		}
	})
export type TAttachServiceAttributeSchema = z.infer<typeof ZAttachServiceAttributeSchema>
