import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetSchema } from './query.get.schema'

export const get = async ({ input }: TRPCHandlerParams<TGetSchema>) => {
	const { id, orgLocationId, organizationId, serviceId } = input

	const result = await prisma.orgEmail.findMany({
		where: {
			id,
			...(organizationId ? { organization: { some: { organizationId } } } : {}),
			...(orgLocationId ? { locations: { some: { orgLocationId } } } : {}),
			...(serviceId ? { services: { some: { serviceId } } } : {}),
		},
		select: {
			id: true,
			email: true,
			firstName: true,
			lastName: true,
			titleId: true,
			primary: true,
			published: true,
			deleted: true,
			description: { select: { tsKey: { select: { text: true } } } },
			locations: { select: { location: { select: { id: true, name: true } } } },
			organization: { select: { organization: { select: { id: true, name: true, slug: true } } } },
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
		({ description, locations, organization, titleId, services, ...record }) => ({
			...record,
			description: description?.tsKey.text,
			locations: locations.map(({ location }) => ({ ...location })),
			organization: organization.map(({ organization }) => ({ ...organization })),
			title: titleId,
			services: services.map(({ service }) => ({
				id: service.id,
				serviceName: service.serviceName?.tsKey.text,
			})),
		})
	)
	return transformedResult
}
