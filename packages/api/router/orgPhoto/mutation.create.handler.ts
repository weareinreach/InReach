import { prisma } from '@weareinreach/db'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema } from './mutation.create.schema'

export const create = async ({ ctx, input }: TRPCHandlerParams<TCreateSchema, 'protected'>) => {
	const auditLogs = CreateAuditLog({ actorId: ctx.session.user.id, operation: 'CREATE', to: input })
	const newRecord = await prisma.orgPhoto.create({
		data: {
			...input,
			auditLogs,
		},
		select: { id: true },
	})
	return newRecord
}
