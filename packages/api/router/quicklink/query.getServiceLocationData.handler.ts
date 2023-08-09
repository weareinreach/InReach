import { type Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetServiceLocationDataSchema } from './query.getServiceLocationData.schema'

export const getServiceLocationData = async ({ input }: TRPCHandlerParams<TGetServiceLocationDataSchema>) => {
	const limit = input.limit ?? 20
	const { skip } = input

	const where = {
		published: true,
		deleted: false,
		locations: {
			some: { services: { none: {} }, published: true },
		},
	} satisfies Prisma.OrganizationWhereInput
	const results = await prisma.organization.findMany({
		where,
		select: {
			id: true,
			name: true,
			slug: true,
			locations: {
				select: {
					id: true,
					name: true,
					published: true,
					services: {
						select: {
							service: {
								select: { id: true, serviceName: { select: { tsKey: { select: { text: true } } } } },
							},
						},
					},
				},
				where: { services: { none: {} }, published: true, deleted: false },
			},
			services: {
				select: {
					id: true,
					serviceName: { select: { tsKey: { select: { text: true } } } },
				},
			},
		},
		orderBy: { id: 'asc' },
		take: limit, // + 1,
		skip,
	})
	const totalResults = await prisma.organization.count({ where })
	const transformedData = results.flatMap(({ locations, services, id, name, slug }) =>
		locations.map(({ id: locationId, name: locationName, services: locationServices, published }) => {
			return {
				orgId: id,
				name,
				slug,
				locationId,
				locationName,
				published,
				attachedServices: locationServices.map(({ service }) => service.id),
				services,
			}
		})
	)
	return {
		results: transformedData,
		totalResults,
	}
}
