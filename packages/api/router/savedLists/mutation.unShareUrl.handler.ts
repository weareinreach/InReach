import { TRPCError } from '@trpc/server'

import { prisma } from '@weareinreach/db'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUnShareUrlSchema } from './mutation.unShareUrl.schema'

export const unShareUrl = async ({ ctx, input }: TRPCHandlerParams<TUnShareUrlSchema, 'protected'>) => {
	const result = await prisma.$transaction(async (tx) => {
		const from = await tx.userSavedList.findUniqueOrThrow({
			where: input,
			select: { sharedLinkKey: true },
		})

		if (from.sharedLinkKey === null)
			throw new TRPCError({ code: 'BAD_REQUEST', message: `No shared URL for listId ${input.id}` })

		const data = { sharedLinkKey: null }
		const sharedUrl = await tx.userSavedList.update({
			where: input,
			data: {
				...data,
				auditLogs: CreateAuditLog({ actorId: ctx.session.user.id, operation: 'UPDATE', from, to: data }),
			},
			select: {
				id: true,
				name: true,
				sharedLinkKey: true,
			},
		})
		return sharedUrl
	})
	return result
}
