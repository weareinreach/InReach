import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema, ZCreateSchema } from './mutation.create.schema'

export const create = async ({ ctx, input }: TRPCHandlerParams<TCreateSchema, 'protected'>) => {
	try {
		const inputData = {
			actorId: ctx.session.user.id,
			operation: 'CREATE',
			data: input,
		}
		const { internalNote, auditLog } = ZCreateSchema().dataParser.parse(inputData)

		const results = await prisma.$transaction(async (tx) => {
			const note = await tx.internalNote.create(internalNote)
			const log = await tx.auditLog.create(auditLog)
			return { note, log }
		})
		return results.note.id
	} catch (error) {
		handleError(error)
	}
}
