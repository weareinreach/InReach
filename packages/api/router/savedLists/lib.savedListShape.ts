import { type Prisma } from '@weareinreach/db'

const isPublic = { published: true, deleted: false }

/**
 * The saved-list shape both `getById` (the owner's view) and `getByUrl` (the public share link) return: the
 * list's name and its organizations and services with enough detail to render them - never `ownedById` or any
 * other internal field of the list row.
 *
 * `publicOnly` drops unpublished or deleted organizations and services. The share link is a public,
 * unauthenticated endpoint, so it must not show an organization that was unpublished or deleted after it was
 * saved; the owner's own view keeps showing everything they saved.
 */
export const savedListSelect = ({ publicOnly }: { publicOnly: boolean }) => {
	const organizationWhere = publicOnly ? { organization: isPublic } : undefined
	const serviceWhere = publicOnly ? { service: { ...isPublic, organization: isPublic } } : undefined

	return {
		id: true,
		name: true,
		_count: {
			select: {
				organizations: organizationWhere ? { where: organizationWhere } : true,
				services: serviceWhere ? { where: serviceWhere } : true,
			},
		},
		updatedAt: true,
		organizations: {
			...(organizationWhere ? { where: organizationWhere } : {}),
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
			...(serviceWhere ? { where: serviceWhere } : {}),
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
	} satisfies Prisma.UserSavedListSelect
}

type SavedListRow = Prisma.UserSavedListGetPayload<{ select: ReturnType<typeof savedListSelect> }>

export const formatSavedList = (list: SavedListRow) => {
	const { services, organizations, ...rest } = list

	return {
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
			({ service: { description, id, organization, serviceName, services: tags, ...svc } }) => ({
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
				tags: tags.map(({ tag }) => tag),
			})
		),
	}
}
