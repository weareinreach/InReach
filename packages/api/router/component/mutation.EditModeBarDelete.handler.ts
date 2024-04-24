import { getAuditedClient } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TEditModeBarDeleteSchema } from './mutation.EditModeBarDelete.schema'

const EditModeBarDelete = async ({
	ctx,
	input,
}: TRPCHandlerParams<TEditModeBarDeleteSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)
		const { deleted, orgLocationId, orgServiceId, slug } = input
		switch (true) {
			case !!slug: {
				const result = await prisma.organization.update({
					where: { slug },
					data: { deleted },
					select: { deleted: true },
				})
				return result
			}
			case !!orgLocationId: {
				const result = await prisma.orgLocation.update({
					where: { id: orgLocationId },
					data: { deleted },
					select: { deleted: true },
				})
				return result
			}
			case !!orgServiceId: {
				const result = await prisma.orgService.update({
					where: { id: orgServiceId },
					data: { deleted },
					select: { deleted: true },
				})
				return result
			}
			default: {
				throw new Error('Invalid input')
			}
		}
	} catch (error) {
		return handleError(error)
	}
}
export default EditModeBarDelete
