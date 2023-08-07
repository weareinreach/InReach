import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetSchema } from './query.get.schema'

export const get = async ({ input }: TRPCHandlerParams<TGetSchema>) => {
	try {
		const { id, orgLocationId, organizationId, serviceId } = input

		const result = await prisma.orgPhone.findMany({
			where: {
				id,
				...(organizationId ? { organization: { organizationId } } : {}),
				...(orgLocationId ? { locations: { some: { orgLocationId } } } : {}),
				...(serviceId ? { services: { some: { serviceId } } } : {}),
			},
			select: {
				id: true,
				number: true,
				ext: true,
				deleted: true,
				primary: true,
				published: true,
				country: { select: { cca2: true, id: true } },
				description: { select: { tsKey: { select: { text: true } } } },
				locations: { select: { location: { select: { id: true, name: true } } } },
				organization: { select: { organization: { select: { id: true, name: true, slug: true } } } },
				phoneType: { select: { id: true, type: true, tsKey: true, tsNs: true } },
				services: {
					select: {
						service: {
							select: {
								id: true,
								serviceName: { select: { tsKey: { select: { text: true } } } },
							},
						},
					},
				},
			},
			orderBy: [{ published: 'desc' }, { deleted: 'desc' }],
		})

		const transformedResult = result.map(
			({ description, locations, organization, phoneType, services, ...record }) => ({
				...record,
				description: description?.tsKey.text,
				locations: locations?.map(({ location }) => ({ ...location })),
				organization: { ...organization?.organization },
				phoneType,
				services: services?.map(({ service }) => ({
					id: service.id,
					serviceName: service.serviceName?.tsKey.text,
				})),
			})
		)
		return transformedResult
	} catch (error) {
		handleError(error)
	}
}
