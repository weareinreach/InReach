import { getAuditedClient } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAttributeEditWrapperSchema } from './mutation.AttributeEditWrapper.schema'

export const AttributeEditWrapper = async ({
	ctx,
	input,
}: TRPCHandlerParams<TAttributeEditWrapperSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)

		const { id, action } = input
		if (action === 'delete') {
			const deleteResult = await prisma.attributeSupplement.delete({
				where: { id },
			})
			return deleteResult
		}

		const current = await prisma.attributeSupplement.findUniqueOrThrow({
			where: { id },
			select: { active: true },
		})
		const updateResult = await prisma.attributeSupplement.update({
			where: { id },
			data: { active: !current.active },
		})
		return updateResult
	} catch (error) {
		return handleError(error)
	}
}
export default AttributeEditWrapper
