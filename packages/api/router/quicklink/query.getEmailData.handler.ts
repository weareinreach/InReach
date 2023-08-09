import { type Prisma, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetEmailDataSchema } from './query.getEmailData.schema'

export const getEmailData = async ({ input }: TRPCHandlerParams<TGetEmailDataSchema>) => {
	const limit = input.limit ?? 20
	const { skip } = input

	const where = {
		published: true,
		deleted: false,
		emails: {
			some: {
				email: { AND: [{ locations: { none: {} } }, { services: { none: {} } }, { published: true }] },
			},
		},
	} satisfies Prisma.OrganizationWhereInput

	const data = await prisma.organization.findMany({
		where,
		select: {
			id: true,
			name: true,
			slug: true,
			locations: { select: { id: true, name: true } },
			services: {
				select: {
					id: true,
					serviceName: { select: { tsKey: { select: { text: true } } } },
				},
			},
			emails: {
				select: {
					email: {
						select: {
							id: true,
							email: true,
							firstName: true,
							lastName: true,
							locationOnly: true,
							serviceOnly: true,
							published: true,
							description: { select: { tsKey: { select: { text: true } } } },
							locations: { select: { location: { select: { id: true } } } },
							services: { select: { service: { select: { id: true } } } },
						},
					},
				},
			},
		},
		orderBy: { id: 'asc' },
		take: limit, // + 1,
		skip,
	})
	const totalResults = await prisma.organization.count({ where })
	const transformedData = data.flatMap(({ locations, emails, services, id, name, slug }) =>
		emails.map(({ email }) => {
			const {
				description,
				id: emailId,
				locations: attachedLocations,
				services: attachedServices,
				...rest
			} = email
			return {
				orgId: id,
				name,
				slug,
				emailId,
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
