import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAttachAttributeSchema, ZAttachAttributeSchema } from './mutation.attachAttribute.schema'

export const attachAttribute = async ({
	ctx,
	input,
}: TRPCHandlerParams<TAttachAttributeSchema, 'protected'>) => {
	try {
		const inputData = { actorId: ctx.session.user.id, operation: 'LINK', data: input }
		const { translationKey, freeText, attributeSupplement, organizationAttribute, auditLogs } =
			ZAttachAttributeSchema().dataParser.parse(inputData)

		const result = await prisma.$transaction(async (tx) => {
			const tKey = translationKey ? await tx.translationKey.create(translationKey) : undefined
			const fText = freeText ? await tx.freeText.create(freeText) : undefined
			const aSupp = attributeSupplement ? await tx.attributeSupplement.create(attributeSupplement) : undefined
			const attrLink = await tx.organizationAttribute.create(organizationAttribute)
			const logs = await tx.auditLog.createMany({ data: auditLogs, skipDuplicates: true })
			return {
				translationKey: tKey,
				freeText: fText,
				attributeSupplement: aSupp,
				organizationAttribute: attrLink,
				auditLog: logs,
			}
		})
		return result
	} catch (error) {
		handleError(error)
	}
}
