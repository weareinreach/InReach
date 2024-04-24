import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetServiceTypesSchema } from './query.getServiceTypes.schema'

const getServiceTypes = async ({ input }: TRPCHandlerParams<TGetServiceTypesSchema>) => {
	try {
		const result = await prisma.socialMediaService.findMany({
			where: input,
			select: {
				id: true,
				active: true,
				logoIcon: true,
				name: true,
				urlBase: true,
			},
		})
		return result
	} catch (error) {
		return handleError(error)
	}
}
export default getServiceTypes
