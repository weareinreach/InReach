import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateServiceAreaSchema, ZCreateServiceAreaSchema } from './mutation.createServiceArea.schema'

export const createServiceArea = async ({
	ctx,
	input,
}: TRPCHandlerParams<TCreateServiceAreaSchema, 'protected'>) => {
	const inputData = {
		actorId: ctx.actorId,
		operation: 'CREATE',
		data: input,
	}
	const { serviceArea, auditLog, serviceAreaCountry, serviceAreaDist } =
		ZCreateServiceAreaSchema().dataParser.parse(inputData)
	const result = await prisma.$transaction(async (tx) => {
		const area = await tx.serviceArea.create(serviceArea)
		const countries = serviceAreaCountry
			? await tx.serviceAreaCountry.createMany({ data: serviceAreaCountry, skipDuplicates: true })
			: undefined
		const districts = serviceAreaDist
			? await tx.serviceAreaDist.createMany({ data: serviceAreaDist, skipDuplicates: true })
			: undefined
		const logs = await tx.auditLog.createMany({ data: auditLog, skipDuplicates: true })

		return {
			serviceArea: area.id,
			auditLog: logs.count,
			serviceAreaCountry: countries?.count ?? 0,
			serviceAreaDist: districts?.count ?? 0,
		}
	})
	return result
}
