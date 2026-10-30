import { TRPCError } from '@trpc/server'

import { getAuditedClient, Prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

const update = async ({ ctx, input }: TRPCHandlerParams<TUpdateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { id, ...data } = input
	try {
		return await prisma.orgUrlDuplicateException.update({
			where: { id },
			data,
			select: { id: true },
		})
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
			throw new TRPCError({
				code: 'CONFLICT',
				message: `"${data.baseUrl}" is already on the exceptions list.`,
				cause: error,
			})
		}
		throw error
	}
}
export default update
