import { TRPCError } from '@trpc/server'

import { prisma } from '@weareinreach/db'
import { globalSelect, globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetByOrgIdSchema } from './query.getByOrgId.schema'
import { select } from './selects'

const getByOrgId = async ({ ctx, input }: TRPCHandlerParams<TGetByOrgIdSchema>) => {
	const locations = await prisma.orgLocation.findMany({
		where: {
			organization: {
				id: input.orgId,
			},
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
			websites: {
				where: { website: globalWhere.isPublic() },
				select: { website: globalSelect.orgWebsite() },
			},
			phones: { where: { phone: globalWhere.isPublic() }, ...select.orgPhone() },
			photos: { where: globalWhere.isPublic(), ...globalSelect.orgPhoto() },
			hours: globalSelect.hours(),
			reviews: { where: { visible: true, deleted: false }, select: { id: true } },
			services: { where: { service: globalWhere.isPublic() }, ...select.service(ctx) },
			serviceAreas: globalSelect.serviceArea(),
			socialMedia: {
				where: { socialMedia: globalWhere.isPublic() },
				select: { socialMedia: globalSelect.socialMedia() },
			},
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
	if (locations.length === 0) {
		throw new TRPCError({ code: 'NOT_FOUND' })
	}
	return locations
}
export default getByOrgId
