import { z } from 'zod'

import { generateFreeText, generateId, InputJsonValue, Prisma } from '@weareinreach/db'
import { CreateBase } from '~api/schemaBase/create'
import { GenerateAuditLog } from '~api/schemas/create/auditLog'

export const ZAttachServiceAttributeSchema = () => {
	const { dataParser: parser, inputSchema } = CreateBase(
		z.object({
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
	)

	const dataParser = parser.transform(({ actorId, data: parsedData }) => {
		const { orgId, orgServiceId, attributeId, supplement: supplementInput } = parsedData

		const supplementId = supplementInput ? generateId('attributeSupplement') : undefined

		const { freeText, translationKey } =
			supplementId && supplementInput?.text
				? generateFreeText({ orgId, text: supplementInput.text, type: 'attSupp', itemId: supplementId })
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
				orgServiceId,
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
			serviceAttribute: Prisma.validator<Prisma.ServiceAttributeCreateArgs>()({
				data: {
					attribute: { connect: { id: attributeId } },
					service: { connect: { id: orgServiceId } },
					supplement: supplementId ? { connect: { id: supplementId } } : undefined,
				},
			}),
			auditLogs: Array.from(auditLogs.values()),
		}
	})
	return { dataParser, inputSchema }
}
export type TAttachServiceAttributeSchema = z.infer<
	ReturnType<typeof ZAttachServiceAttributeSchema>['inputSchema']
>
