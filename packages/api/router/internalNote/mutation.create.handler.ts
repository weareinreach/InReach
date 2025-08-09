import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema } from './mutation.create.schema'

const create = async ({ ctx, input }: TRPCHandlerParams<TCreateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)

	const data = {
		...input.data,
		userId: ctx.actorId,
	}

	const { id } = await prisma.internalNote.create({ data })

	return { id }
}
export default create
