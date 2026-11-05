import { isIdFor, prisma } from '@weareinreach/db'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForServiceInfoCardSchema } from './query.forServiceInfoCard.schema'
import { DATA_PORTAL_PERMISSIONS } from '../organization/lib/createOrgSuggestion'

const forServiceInfoCard = async ({ input, ctx }: TRPCHandlerParams<TForServiceInfoCardSchema>) => {
	const { parentId, isEditMode, remoteOnly } = input

	// Previously `ctx.session?.user` - true for any logged-in user at all, not just staff, since it never
	// checked for an actual permission.
	const canSeeAll = Boolean(
		isEditMode && ctx.session?.user?.permissions.some((p) => DATA_PORTAL_PERMISSIONS.includes(p))
	)
	const recordVisiblity = { ...(!canSeeAll && globalWhere.isPublic()) }

	const result = await prisma.orgService.findMany({
		where: {
			...recordVisiblity,
			...(isIdFor('organization', parentId)
				? { organization: { id: parentId, ...recordVisiblity } }
				: { locations: { some: { location: { id: parentId, ...recordVisiblity } } } }),
			...(remoteOnly
				? { attributes: { some: { attribute: { active: true, tag: 'offers-remote-services' } } } }
				: {}),
			OR: [{ crisisSupportOnly: null }, { crisisSupportOnly: false }],
		},
		select: {
			id: true,
			serviceName: { select: { key: true, ns: true, tsKey: { select: { text: true } } } },
			services: {
				select: {
					tag: {
						select: { tsKey: true, primaryCategory: { select: { tsKey: true } } },
					},
				},
				where: { tag: { active: true, primaryCategory: { active: true } } },
			},
			attributes: {
				where: { attribute: { active: true, tag: 'offers-remote-services' } },
				select: { attributeId: true },
			},
			published: true,
			deleted: true,
		},
	})

	const transformed = result.map(({ id, serviceName, services, attributes, ...status }) => ({
		id,
		...status,
		serviceName: serviceName
			? { tsKey: serviceName.key, tsNs: serviceName.ns, defaultText: serviceName.tsKey.text }
			: null,
		serviceCategories: [...new Set(services.map(({ tag }) => tag.primaryCategory.tsKey))].sort((a, b) =>
			a.localeCompare(b)
		),
		offersRemote: attributes.length > 0,
	}))
	return transformed
}
export default forServiceInfoCard
