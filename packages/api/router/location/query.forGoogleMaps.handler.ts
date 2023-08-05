import { TRPCError } from '@trpc/server'

import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForGoogleMapsSchema } from './query.forGoogleMaps.schema'

export const forGoogleMaps = async ({ input }: TRPCHandlerParams<TForGoogleMapsSchema>) => {
	try {
		const select = {
			id: true,
			name: true,
			latitude: true,
			longitude: true,
		}

		const result = Array.isArray(input)
			? await prisma.orgLocation.findMany({
					where: {
						...globalWhere.isPublic(),
						id: { in: input },
					},
					select,
			  })
			: await prisma.orgLocation.findUniqueOrThrow({
					where: {
						...globalWhere.isPublic(),
						id: input,
					},
					select,
			  })

		if (Array.isArray(input) && Array.isArray(result) && !result.length) {
			throw new TRPCError({ code: 'NOT_FOUND' })
		}
		return result
	} catch (error) {
		handleError(error)
	}
}
