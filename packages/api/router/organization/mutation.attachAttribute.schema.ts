import { z } from 'zod'

import { generateFreeText, generateId, InputJsonValue, Prisma } from '@weareinreach/db'
import { CreateBase } from '~api/schemaBase/create'
import { GenerateAuditLog } from '~api/schemas/create/auditLog'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZAttachAttributeSchema = () => {
	const { dataParser: parser, inputSchema } = CreateBase(
		z.object({
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
	)

	const dataParser = parser.transform(({ actorId, data: parsedData }) => {
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
		const auditLogs = new Set<Prisma.AuditLogCreateManyAccountInput>()

		if (freeText && translationKey) {
			auditLogs.add(
				GenerateAuditLog({
					actorId,
					operation: 'CREATE',
					freeTextId: freeText.id,
					to: translationKey,
					translationKey: translationKey.key,
				})
			)
		}

		const supplementData = supplementInput
			? { id: supplementId, countryId, boolean, data, govDistId, languageId, textId: freeText?.id }
			: undefined
		if (supplementData)
			auditLogs.add(
				GenerateAuditLog({
					actorId,
					operation: 'CREATE',
					to: supplementData,
					attributeSupplementId: supplementData.id,
					attributeId,
				})
			)

		auditLogs.add(
			GenerateAuditLog({
				actorId,
				operation: 'LINK',
				organizationId,
				attributeId,
				attributeSupplementId: supplementData?.id,
			})
		)

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
			organizationAttribute: Prisma.validator<Prisma.OrganizationAttributeCreateArgs>()({
				data: {
					attribute: { connect: { id: attributeId } },
					organization: { connect: { id: organizationId } },
					supplement: supplementId ? { connect: { id: supplementId } } : undefined,
				},
			}),
			auditLogs: Array.from(auditLogs.values()),
		}
	})
	return { dataParser, inputSchema }
}
export type TAttachAttributeSchema = z.infer<ReturnType<typeof ZAttachAttributeSchema>['inputSchema']>
