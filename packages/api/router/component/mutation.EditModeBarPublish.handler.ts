import { getAuditedClient } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TEditModeBarPublishSchema } from './mutation.EditModeBarPublish.schema'

const EditModeBarPublish = async ({
	ctx,
	input,
}: TRPCHandlerParams<TEditModeBarPublishSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)
		const { published, orgLocationId, orgServiceId, slug } = input
		switch (true) {
			case !!slug: {
				const result = await prisma.organization.update({
					where: { slug },
					data: { published },
					select: { published: true },
				})
				return result
			}
			case !!orgLocationId: {
				const result = await prisma.orgLocation.update({
					where: { id: orgLocationId },
					data: { published },
					select: { published: true },
				})
				return result
			}
			case !!orgServiceId: {
				const result = await prisma.orgService.update({
					where: { id: orgServiceId },
					data: { published },
					select: { published: true },
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
export default EditModeBarPublish
