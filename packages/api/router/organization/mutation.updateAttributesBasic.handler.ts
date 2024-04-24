import { generateId, getAuditedClient } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateAttributesBasicSchema } from './mutation.updateAttributesBasic.schema'

const updateAttributesBasic = async ({
	ctx,
	input,
}: TRPCHandlerParams<TUpdateAttributesBasicSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)

		const result = await prisma.$transaction(async (tx) => {
			const { count: added } = input.createdVals
				? await tx.attributeSupplement.createMany({
						data: input.createdVals.map((id) => ({
							id: generateId('attributeSupplement'),
							organizationId: input.id,
							attributeId: id,
						})),
						skipDuplicates: true,
					})
				: { count: 0 }
			const { count: removed } = input.deletedVals
				? await tx.attributeSupplement.deleteMany({
						where: {
							organizationId: input.id,
							attributeId: { in: input.deletedVals },
						},
					})
				: { count: 0 }
			return { added, removed }
		})
		return result
	} catch (error) {
		return handleError(error)
	}
}
export default updateAttributesBasic
