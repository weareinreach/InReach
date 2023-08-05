import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { globalSelect, globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForLocationPageSchema } from './query.forLocationPage.schema'
import { select } from './selects'

export const forLocationPage = async ({ input }: TRPCHandlerParams<TForLocationPageSchema>) => {
	try {
		const location = await prisma.orgLocation.findUniqueOrThrow({
			where: {
				id: input.id,
				...globalWhere.isPublic(),
			},
			select: {
				id: true,
				primary: true,
				name: true,
				street1: true,
				street2: true,
				city: true,
				postCode: true,
				country: { select: { cca2: true } },
				govDist: { select: { abbrev: true, tsKey: true, tsNs: true } },
				longitude: true,
				latitude: true,
				description: globalSelect.freeText(),
				attributes: select.attributes(),
				reviews: {
					where: { visible: true, deleted: false },
					select: { id: true },
				},
			},
		})
		return location
	} catch (error) {
		handleError(error)
	}
}
