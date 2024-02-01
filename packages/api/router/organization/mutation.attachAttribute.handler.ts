import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAttachAttributeSchema } from './mutation.attachAttribute.schema'

export const attachAttribute = async ({
	ctx,
	input,
}: TRPCHandlerParams<TAttachAttributeSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { translationKey, freeText, attributeSupplement } = input

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
export default attachAttribute
