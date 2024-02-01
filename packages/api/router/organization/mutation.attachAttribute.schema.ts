import { z } from 'zod'

import { generateFreeText, generateId, InputJsonValue, Prisma } from '@weareinreach/db'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZAttachAttributeSchema = z
	.object({
		organizationId: prefixedId('organization'),
		attributeId: prefixedId('attribute'),
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
		const { organizationId, attributeId, supplement: supplementInput } = parsedData

		const supplementId = supplementInput ? generateId('attributeSupplement') : undefined

		const { freeText, translationKey } =
			supplementId && supplementInput?.text
				? generateFreeText({
						orgId: organizationId,
						text: supplementInput.text,
						type: 'attSupp',
						itemId: supplementId,
					})
				: { freeText: undefined, translationKey: undefined }

		const { boolean, countryId, data, govDistId, languageId } = supplementInput ?? {}

		const supplementData = supplementInput
			? {
					id: supplementId,
					countryId,
					boolean,
					data,
					govDistId,
					languageId,
					textId: freeText?.id,
					attributeId,
					organizationId,
				}
			: undefined

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
export type TAttachAttributeSchema = z.infer<typeof ZAttachAttributeSchema>
