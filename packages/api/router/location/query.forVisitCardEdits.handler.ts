import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForVisitCardEditsSchema } from './query.forVisitCardEdits.schema'

export const forVisitCardEdits = async ({ input }: TRPCHandlerParams<TForVisitCardEditsSchema>) => {
	try {
		const result = await prisma.orgLocation.findUnique({
			where: {
				id: input,
			},
			select: {
				id: true,
				name: true,
				street1: true,
				street2: true,
				city: true,
				postCode: true,
				country: { select: { cca2: true } },
				govDist: { select: { abbrev: true, tsKey: true, tsNs: true } },
				attributes: {
					where: { attribute: { tsKey: 'additional.offers-remote-services' } },
					select: { attribute: { select: { tsKey: true, icon: true } } },
				},
				latitude: true,
				longitude: true,
			},
		})
		if (!result) return null
		const { attributes, ...rest } = result
		const transformed = {
			...rest,
			remote: attributes.find(({ attribute }) => attribute.tsKey === 'additional.offers-remote-services')
				?.attribute,
		}
		return transformed
	} catch (err) {
		return handleError(err)
	}
}
