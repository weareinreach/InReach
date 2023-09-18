import { prisma } from '@weareinreach/db'
import { globalSelect, globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetByIdSchema } from './query.getById.schema'
import { select } from './selects'

export const getById = async ({ ctx, input }: TRPCHandlerParams<TGetByIdSchema>) => {
	const location = await prisma.orgLocation.findUniqueOrThrow({
		where: {
			id: input.id,
			...globalWhere.isPublic(),
		},
		select: {
			govDist: globalSelect.govDistBasic(),
			country: globalSelect.country(),
			attributes: {
				where: {
					attribute: {
						active: true,
						categories: {
							some: {
								category: {
									active: true,
								},
							},
						},
					},
				},
				...select.attributes(),
			},
			emails: { where: { email: globalWhere.isPublic() }, ...select.orgEmail() },
			websites: { where: globalWhere.isPublic(), ...globalSelect.orgWebsite() },
			phones: { where: { phone: globalWhere.isPublic() }, ...select.orgPhone() },
			photos: { where: globalWhere.isPublic(), ...globalSelect.orgPhoto() },
			hours: globalSelect.hours(),
			reviews: { where: { visible: true, deleted: false }, select: { id: true } },
			services: { where: { service: globalWhere.isPublic() }, ...select.service(ctx) },
			serviceAreas: globalSelect.serviceArea(),
			socialMedia: { where: globalWhere.isPublic(), ...globalSelect.socialMedia() },
			description: globalSelect.freeText(),
			name: true,
			street1: true,
			street2: true,
			city: true,
			postCode: true,
			primary: true,
			longitude: true,
			latitude: true,
			id: true,
		},
	})
	return location
}
