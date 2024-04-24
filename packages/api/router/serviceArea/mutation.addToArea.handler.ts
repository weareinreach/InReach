import { TRPCError } from '@trpc/server'

import { generateId, getAuditedClient } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAddToAreaSchema } from './mutation.addToArea.schema'

export const addToArea = async ({ ctx, input }: TRPCHandlerParams<TAddToAreaSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)

		const { id: serviceAreaId } =
			typeof input.serviceArea === 'string'
				? { id: input.serviceArea }
				: await prisma.serviceArea.create({
						data: {
							id: generateId('serviceArea'),
							...input.serviceArea,
						},
						select: { id: true },
					})
		if (input.countryId) {
			await prisma.serviceAreaCountry.create({
				data: {
					serviceAreaId,
					countryId: input.countryId,
				},
			})
			return { result: 'added' }
		} else if (input.govDistId) {
			await prisma.serviceAreaDist.create({
				data: {
					serviceAreaId,
					govDistId: input.govDistId,
				},
			})
			return { result: 'added' }
		} else {
			throw new TRPCError({ code: 'BAD_REQUEST' })
		}
	} catch (error) {
		return handleError(error)
	}
}
export default addToArea
