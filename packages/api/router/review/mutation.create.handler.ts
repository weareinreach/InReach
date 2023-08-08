import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema } from './mutation.create.schema'

export const create = async ({ ctx, input }: TRPCHandlerParams<TCreateSchema, 'protected'>) => {
	try {
		const review = await prisma.orgReview.create({
			data: {
				...input,
				userId: ctx.session.user.id,
				auditLogs: CreateAuditLog({
					actorId: ctx.actorId,
					operation: 'CREATE',
					to: { ...input, userId: ctx.session.user.id },
				}),
			},
			select: { id: true },
		})

		return review
	} catch (error) {
		handleError(error)
	}
}
