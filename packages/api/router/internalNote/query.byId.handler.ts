import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TByIdSchema } from './query.byId.schema'

export const byId = async ({ input }: TRPCHandlerParams<TByIdSchema, 'protected'>) => {
	const result = await prisma.internalNote.findFirstOrThrow({ where: { id: input } })
	return result
}
