import { TRPCError } from '@trpc/server'

import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { updateGeo } from '~api/lib/prismaRaw/updateGeo'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

export const update = async ({ ctx, input }: TRPCHandlerParams<TUpdateSchema>) => {
	try {
		if (ctx.session === null || !ctx.session?.user.id) throw new TRPCError({ code: 'UNAUTHORIZED' })

		const { where, data } = input
		const updatedRecord = await prisma.$transaction(async (tx) => {
			const current = await tx.orgLocation.findUniqueOrThrow({ where })
			const auditLog = CreateAuditLog({
				actorId: ctx.session!.user.id,
				operation: 'UPDATE',
				from: current,
				to: data,
			})
			const update = await tx.orgLocation.update({
				where,
				data: { ...data, auditLogs: auditLog },
				select: { id: true },
			})

			// if WKT is updated, we need to have the DB update the `geo` column with raw SQL.
			if (data.geoWKT) await updateGeo('orgLocation', where.id, tx)

			return update
		})
		return updatedRecord
	} catch (error) {
		handleError(error)
	}
}
