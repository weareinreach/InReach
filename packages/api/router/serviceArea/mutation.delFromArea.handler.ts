import { TRPCError } from '@trpc/server'

import { getAuditedClient } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TDelFromAreaSchema } from './mutation.delFromArea.schema'

export const delFromArea = async ({ ctx, input }: TRPCHandlerParams<TDelFromAreaSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)

		if (input.countryId) {
			const { serviceAreaId, countryId } = input
			await prisma.serviceAreaCountry.delete({
				where: {
					serviceAreaId_countryId: {
						serviceAreaId,
						countryId,
					},
				},
			})
			return { result: 'deleted' }
		} else if (input.govDistId) {
			const { serviceAreaId, govDistId } = input
			await prisma.serviceAreaDist.delete({
				where: {
					serviceAreaId_govDistId: {
						serviceAreaId,
						govDistId,
					},
				},
			})

			return { result: 'deleted' }
		}

		throw new TRPCError({ code: 'BAD_REQUEST' })
	} catch (error) {
		return handleError(error)
	}
}
export default delFromArea
