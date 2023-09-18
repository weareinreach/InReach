import { type Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetPhoneDataSchema } from './query.getPhoneData.schema'

export const getPhoneData = async ({ input }: TRPCHandlerParams<TGetPhoneDataSchema>) => {
	const limit = input.limit ?? 20
	const { skip } = input

	const where = {
		published: true,
		deleted: false,
		phones: {
			some: {
				phone: { AND: [{ locations: { none: {} } }, { services: { none: {} } }, { published: true }] },
			},
		},
	} satisfies Prisma.OrganizationWhereInput

	const data = await prisma.organization.findMany({
		where,
		select: {
			id: true,
			name: true,
			slug: true,
			locations: {
				select: {
					id: true,
					name: true,
					// phones: { select: { phone: { select: { id: true } } } },
				},
			},
			phones: {
				select: {
					phone: {
						select: {
							id: true,
							number: true,
							description: { select: { tsKey: { select: { text: true } } } },
							country: { select: { id: true, cca2: true } },
							locationOnly: true,
							serviceOnly: true,
							locations: { select: { location: { select: { id: true } } } },
							services: { select: { service: { select: { id: true } } } },
							published: true,
						},
					},
				},
			},
			services: {
				select: {
					id: true,
					serviceName: { select: { tsKey: { select: { text: true } } } },
					// phones: { select: { phone: { select: { id: true } } } },
				},
			},
		},
		orderBy: { id: 'asc' },
		take: limit, // + 1,
		skip,
	})
	const totalResults = await prisma.organization.count({ where })
	const transformedData = data.flatMap(({ locations, phones, services, id, name, slug }) =>
		phones.map(({ phone }) => {
			const {
				description,
				id: phoneId,
				locations: attachedLocations,
				services: attachedServices,
				...rest
			} = phone
			return {
				orgId: id,
				name,
				slug,
				phoneId,
				...rest,
				description: description?.tsKey.text,
				attachedLocations: attachedLocations.map(({ location }) => location.id),
				attachedServices: attachedServices.map(({ service }) => service.id),
				locations,
				services,
			}
		})
	)
	return {
		results: transformedData,
		totalResults,
	}
}
