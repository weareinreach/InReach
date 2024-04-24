import { getAuditedClient } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TEditModeBarReverifySchema } from './mutation.EditModeBarReverify.schema'

const EditModeBarReverify = async ({
	ctx,
	input,
}: TRPCHandlerParams<TEditModeBarReverifySchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)

		const reverify = await prisma.organization.update({
			where: {
				slug: input.slug,
			},
			data: {
				lastVerified: new Date(),
			},
			select: {
				slug: true,
				lastVerified: true,
			},
		})
		return reverify
	} catch (error) {
		return handleError(error)
	}
}
export default EditModeBarReverify
