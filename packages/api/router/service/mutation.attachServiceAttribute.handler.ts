import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import {
	type TAttachServiceAttributeSchema,
	ZAttachServiceAttributeSchema,
} from './mutation.attachServiceAttribute.schema'

export const attachServiceAttribute = async ({
	ctx,
	input,
}: TRPCHandlerParams<TAttachServiceAttributeSchema, 'protected'>) => {
	const inputData = {
		actorId: ctx.actorId,
		operation: 'CREATE',
		data: input,
	}
	const { attributeSupplement, auditLogs, freeText, serviceAttribute, translationKey } =
		ZAttachServiceAttributeSchema().dataParser.parse(inputData)

	const result = await prisma.$transaction(async (tx) => {
		const tKey = translationKey ? await tx.translationKey.create(translationKey) : undefined
		const fText = freeText ? await tx.freeText.create(freeText) : undefined
		const aSupp = attributeSupplement ? await tx.attributeSupplement.create(attributeSupplement) : undefined
		const attrLink = await tx.serviceAttribute.create(serviceAttribute)
		const logs = await tx.auditLog.createMany({ data: auditLogs, skipDuplicates: true })
		return {
			translationKey: tKey,
			freeText: fText,
			attributeSupplement: aSupp,
			serviceAttribute: attrLink,
			auditLog: logs,
		}
	})
	return result
}
