import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetByIdInputSchema } from './query.getById.schema'

const getById = async ({ ctx, input }: TRPCHandlerParams<TGetByIdInputSchema, 'protected'>) => {
	const list = await prisma.userSavedList.findFirst({
		where: {
			id: input?.id ?? '',
			OR: [{ ownedById: ctx.session.user.id }, { sharedWith: { some: { userId: ctx.session.user.id } } }],
		},
		select: {
			id: true,
			name: true,
			_count: {
				select: {
					organizations: true,
					services: true,
				},
			},
			updatedAt: true,
			organizations: {
				select: {
					organization: {
						select: {
							id: true,
							slug: true,
							name: true,
							description: { select: { tsKey: { select: { key: true, ns: true, text: true } } } },
							// locations: true,
							// orgLeader: true,
							// orgFocus: true,
							// serviceCategories: true,
							// national: true,
						},
					},
				},
			},
			services: {
				select: {
					service: {
						select: {
							id: true,
							serviceName: {
								select: { tsKey: { select: { key: true, ns: true, text: true } } },
							},
							// ...orgSelect,
							description: {
								select: { tsKey: { select: { key: true, ns: true, text: true } } },
							},
						},
					},
				},
			},
		},
	})
	if (!list) {
		return null
	}

	const { services, organizations, ...rest } = list

	const reformattedData = {
		...rest,
		organizations: organizations.map(({ organization: { description, ...org } }) => ({
			...org,
			description: {
				key: description?.tsKey.key,
				ns: description?.tsKey.ns,
				defaultText: description?.tsKey.text ?? '',
			},
		})),
		services: services.map(({ service: { description, id, serviceName, ...svc } }) => ({
			...svc,
			id,
			slug: id,
			name: {
				key: serviceName?.tsKey.key,
				ns: serviceName?.tsKey.ns,
				defaultText: serviceName?.tsKey.text ?? '',
			},
			description: {
				key: description?.tsKey.key,
				ns: description?.tsKey.ns,
				defaultText: description?.tsKey.text ?? '',
			},
		})),
	}

	return reformattedData
}

export default getById
