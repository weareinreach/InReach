import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateNewQuickSchema } from './mutation.createNewQuick.schema'

export const createNewQuick = async ({
	ctx,
	input,
}: TRPCHandlerParams<TCreateNewQuickSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)

	const result = await prisma.organization.create(input)

	return result
}
export default createNewQuick
