import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetByIdSchema } from './query.getById.schema'

const getById = async ({ ctx, input }: TRPCHandlerParams<TGetByIdSchema, 'protected'>) => {
	const list = await prisma.userSavedList.findFirst({
		where: {
			id: input.id,
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
							locations: { select: { city: true } },
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
								select: {
									attribute: { select: { id: true, icon: true, iconBg: true, tsKey: true, tsNs: true } },
								},
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
							organization: { select: { slug: true, name: true } },
							description: {
								select: { tsKey: { select: { key: true, ns: true, text: true } } },
							},
							services: { select: { tag: { select: { id: true, tsKey: true, tsNs: true } } } },
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
		organizations: organizations.map(({ organization: { description, attributes, locations, ...org } }) => {
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
				description: description
					? {
							key: description.tsKey.key,
							ns: description.tsKey.ns,
							defaultText: description.tsKey.text,
						}
					: null,
				cities: locations.map(({ city }) => city),
			}
		}),
		services: services.map(
			({ service: { description, id, organization, serviceName, services, ...svc } }) => ({
				...svc,
				id,
				slug: organization?.slug ?? '',
				orgName: organization?.name ?? '',
				name: serviceName
					? {
							key: serviceName.tsKey.key,
							ns: serviceName.tsKey.ns,
							defaultText: serviceName.tsKey.text,
						}
					: null,
				description: description
					? {
							key: description.tsKey.key,
							ns: description.tsKey.ns,
							defaultText: description.tsKey.text ?? '',
						}
					: null,
				tags: services.map(({ tag }) => tag),
			})
		),
	}

	return reformattedData
}

export default getById
