import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForVisitCardSchema } from './query.forVisitCard.schema'

export const forVisitCard = async ({ input }: TRPCHandlerParams<TForVisitCardSchema>) => {
	const result = await prisma.orgLocation.findUniqueOrThrow({
		where: {
			...globalWhere.isPublic(),
			id: input,
		},
		select: {
			id: true,
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
		},
	})
	const { attributes, ...rest } = result
	const transformed = {
		...rest,
		remote: attributes.find(({ attribute }) => attribute.tsKey === 'additional.offers-remote-services')
			?.attribute,
	}
	return transformed
}
