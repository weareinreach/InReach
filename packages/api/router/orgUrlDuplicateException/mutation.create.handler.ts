import { TRPCError } from '@trpc/server'

import { generateId, getAuditedClient, Prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema } from './mutation.create.schema'

const create = async ({ ctx, input }: TRPCHandlerParams<TCreateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	try {
		return await prisma.orgUrlDuplicateException.create({
			data: {
				id: generateId('orgUrlDuplicateException'),
				baseUrl: input.baseUrl,
				description: input.description,
				createdById: ctx.actorId,
			},
			select: { id: true },
		})
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
			throw new TRPCError({
				code: 'CONFLICT',
				message: `"${input.baseUrl}" is already on the exceptions list.`,
				cause: error,
			})
		}
		throw error
	}
}
export default create
