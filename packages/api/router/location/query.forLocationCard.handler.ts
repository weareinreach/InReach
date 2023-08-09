import { prisma } from '@weareinreach/db'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForLocationCardSchema } from './query.forLocationCard.schema'

export const forLocationCard = async ({ input }: TRPCHandlerParams<TForLocationCardSchema>) => {
	const result = await prisma.orgLocation.findUniqueOrThrow({
		where: {
			id: input,
			...globalWhere.isPublic(),
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
			phones: {
				where: { phone: globalWhere.isPublic() },
				select: { phone: { select: { primary: true, number: true, country: { select: { cca2: true } } } } },
			},
			attributes: { select: { attribute: { select: { tsNs: true, tsKey: true, icon: true } } } },
			services: {
				select: {
					service: {
						select: {
							services: { select: { tag: { select: { category: { select: { tsKey: true } } } } } },
						},
					},
				},
			},
		},
	})

	const transformed = {
		...result,
		country: result.country.cca2,
		phones: result.phones.map(({ phone }) => ({ ...phone, country: phone.country.cca2 })),
		attributes: result.attributes.map(({ attribute }) => attribute),
		services: [
			...new Set(
				result.services.flatMap(({ service }) => service.services.map(({ tag }) => tag.category.tsKey))
			),
		],
	}

	return transformed
}
