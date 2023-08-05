import { TRPCError } from '@trpc/server'

import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { globalSelect, globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetByOrgIdSchema } from './query.getByOrgId.schema'
import { select } from './selects'

export const getByOrgId = async ({ ctx, input }: TRPCHandlerParams<TGetByOrgIdSchema>) => {
	try {
		const locations = await prisma.orgLocation.findMany({
			where: {
				id: input.orgId,
				...globalWhere.isPublic(),
			},
			select: {
				govDist: select.govDistBasic(),
				country: select.country(),
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
				websites: { where: globalWhere.isPublic(), ...select.orgWebsite() },
				phones: { where: { phone: globalWhere.isPublic() }, ...select.orgPhone() },
				photos: { where: globalWhere.isPublic(), ...select.orgPhoto() },
				hours: select.hours(),
				reviews: { where: { visible: true, deleted: false }, select: { id: true } },
				services: { where: { service: globalWhere.isPublic() }, ...select.service(ctx) },
				serviceAreas: select.serviceArea(),
				socialMedia: { where: globalWhere.isPublic(), ...select.socialMedia() },
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
		if (locations.length === 0) throw new TRPCError({ code: 'NOT_FOUND' })
		return locations
	} catch (error) {
		handleError(error)
	}
}
