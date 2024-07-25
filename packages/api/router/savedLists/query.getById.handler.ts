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
							attributes: {
								where: {
									active: true,
									attribute: {
										active: true,
										parents: { none: {} },
										categories: {
											some: {
												category: { OR: [{ tag: 'organization-leadership' }, { tag: 'service-focus' }] },
											},
										},
									},
								},
								select: { attribute: { select: { icon: true, iconBg: true, tsKey: true, tsNs: true } } },
							},
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
							organization: { select: { slug: true } },
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
		organizations: organizations.map(({ organization: { description, attributes, ...org } }) => {
			const leaderBadges = attributes
				.filter(({ attribute: { tsKey } }) => tsKey.startsWith('orgleader.'))
				.map(({ attribute }) => attribute)
			const communityBadges = attributes
				.filter(({ attribute: { tsKey } }) => tsKey.startsWith('srvfocus.'))
				.map(({ attribute }) => attribute)

			return {
				...org,
				leaderBadges,
				communityBadges,
				description: {
					key: description?.tsKey.key,
					ns: description?.tsKey.ns,
					defaultText: description?.tsKey.text ?? '',
				},
			}
		}),
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
