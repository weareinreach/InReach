import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateAccessInstructionsSchema } from './mutation.createAccessInstructions.schema'

export const createAccessInstructions = async ({
	ctx,
	input,
}: TRPCHandlerParams<TCreateAccessInstructionsSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)

	const { attributeSupplement, freeText, translationKey } = input
	const result = await prisma.$transaction(async (tx) => {
		const tKey = translationKey ? await tx.translationKey.create(translationKey) : undefined
		const fText = freeText ? await tx.freeText.create(freeText) : undefined
		const aSupp = attributeSupplement ? await tx.attributeSupplement.create(attributeSupplement) : undefined
		return {
			translationKey: tKey,
			freeText: fText,
			attributeSupplement: aSupp,
		}
	})
	return result
}
export default createAccessInstructions
