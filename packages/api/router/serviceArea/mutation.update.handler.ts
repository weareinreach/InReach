import { getAuditedClient } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

const update = async ({ input, ctx }: TRPCHandlerParams<TUpdateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	try {
		const { id: serviceAreaId, districts, countries } = input

		const txn = await prisma.$transaction(async (tx) => {
			const results = {
				countries: {
					created: 0,
					deleted: 0,
				},
				districts: {
					created: 0,
					deleted: 0,
				},
			}
			if (districts.createdVals) {
				const { count } = await tx.serviceAreaDist.createMany({
					data: districts.createdVals.map((govDistId) => ({ serviceAreaId, govDistId })),
					skipDuplicates: true,
				})
				results.districts.created = count
			}
			if (districts.deletedVals) {
				const { count } = await tx.serviceAreaDist.deleteMany({
					where: { serviceAreaId, govDistId: { in: districts.deletedVals } },
				})
				results.districts.deleted = count
			}
			if (countries.createdVals) {
				const { count } = await tx.serviceAreaCountry.createMany({
					data: countries.createdVals.map((countryId) => ({ serviceAreaId, countryId })),
					skipDuplicates: true,
				})
				results.countries.created = count
			}
			if (countries.deletedVals) {
				const { count } = await tx.serviceAreaCountry.deleteMany({
					where: { serviceAreaId, countryId: { in: countries.deletedVals } },
				})
				results.countries.deleted = count
			}
			return results
		})
		return txn
	} catch (error) {
		return handleError(error)
	}
}
export default update
