import { z } from 'zod'

import { generateFreeText, generateId, InputJsonValue, Prisma } from '@weareinreach/db'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZCreateAccessInstructionsSchema = z
	.object({
		orgId: prefixedId('organization'),
		serviceId: prefixedId('orgService'),
		attributeId: prefixedId('attribute'),
		supplement: z
			.object({
				data: InputJsonValue.optional(),
				boolean: z.boolean().optional(),
				countryId: prefixedId('country').optional(),
				govDistId: prefixedId('govDist').optional(),
				languageId: prefixedId('language').optional(),
				text: z.string().optional(),
			})
			.optional(),
	})

	.transform((parsedData) => {
		const { orgId, serviceId, attributeId, supplement: supplementInput } = parsedData

		const supplementId = generateId('attributeSupplement')

		const { freeText, translationKey } =
			supplementId && supplementInput?.text
				? generateFreeText({ orgId, text: supplementInput.text, type: 'attSupp', itemId: supplementId })
				: { freeText: undefined, translationKey: undefined }

		const { boolean, countryId, data, govDistId, languageId } = supplementInput ?? {}

		const supplementData = {
			id: supplementId,
			attributeId,
			serviceId,
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

export type TCreateAccessInstructionsSchema = z.infer<typeof ZCreateAccessInstructionsSchema>
