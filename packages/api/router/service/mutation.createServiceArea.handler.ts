import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateServiceAreaSchema } from './mutation.createServiceArea.schema'

const createServiceArea = async ({
	ctx,
	input,
}: TRPCHandlerParams<TCreateServiceAreaSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { serviceArea, serviceAreaCountry, serviceAreaDist } = input
	const result = await prisma.$transaction(async (tx) => {
		const area = await tx.serviceArea.create(serviceArea)
		const countries = serviceAreaCountry
			? await tx.serviceAreaCountry.createMany({ data: serviceAreaCountry, skipDuplicates: true })
			: undefined
		const districts = serviceAreaDist
			? await tx.serviceAreaDist.createMany({ data: serviceAreaDist, skipDuplicates: true })
			: undefined

		return {
			serviceArea: area.id,
			serviceAreaCountry: countries?.count ?? 0,
			serviceAreaDist: districts?.count ?? 0,
		}
	})
	return result
}
export default createServiceArea
