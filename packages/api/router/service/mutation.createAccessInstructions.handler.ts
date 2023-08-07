import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import {
	type TCreateAccessInstructionsSchema,
	ZCreateAccessInstructionsSchema,
} from './mutation.createAccessInstructions.schema'

export const createAccessInstructions = async ({
	ctx,
	input,
}: TRPCHandlerParams<TCreateAccessInstructionsSchema, 'protected'>) => {
	try {
		const inputData = { actorId: ctx.actorId, operation: 'CREATE', data: input }

		const { serviceAccessAttribute, attributeSupplement, auditLogs, freeText, translationKey } =
			ZCreateAccessInstructionsSchema().dataParser.parse(inputData)
		const result = await prisma.$transaction(async (tx) => {
			const tKey = translationKey ? await tx.translationKey.create(translationKey) : undefined
			const fText = freeText ? await tx.freeText.create(freeText) : undefined
			const aSupp = attributeSupplement ? await tx.attributeSupplement.create(attributeSupplement) : undefined
			const attrLink = await tx.serviceAccessAttribute.create(serviceAccessAttribute)
			const logs = await tx.auditLog.createMany({ data: auditLogs, skipDuplicates: true })
			return {
				translationKey: tKey,
				freeText: fText,
				attributeSupplement: aSupp,
				serviceAccessAttribute: attrLink,
				auditLog: logs,
			}
		})
		return result
	} catch (error) {
		handleError(error)
	}
}
