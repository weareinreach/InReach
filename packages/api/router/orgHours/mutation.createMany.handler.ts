import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateManySchema } from './mutation.createMany.schema'

const createMany = async ({ ctx, input }: TRPCHandlerParams<TCreateManySchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const hours = await prisma.orgHours.createMany({ data: input, skipDuplicates: true })

	return hours
}
export default createMany
