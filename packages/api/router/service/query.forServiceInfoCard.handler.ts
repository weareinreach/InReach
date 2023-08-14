import { isIdFor, prisma } from '@weareinreach/db'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForServiceInfoCardSchema } from './query.forServiceInfoCard.schema'

export const forServiceInfoCard = async ({ input }: TRPCHandlerParams<TForServiceInfoCardSchema>) => {
	const result = await prisma.orgService.findMany({
		where: {
			...globalWhere.isPublic(),
			...(isIdFor('organization', input.parentId)
				? { organization: { id: input.parentId, ...globalWhere.isPublic() } }
				: { locations: { some: { location: { id: input.parentId, ...globalWhere.isPublic() } } } }),
			...(input.remoteOnly
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
						select: { tsKey: true, category: { select: { tsKey: true } } },
					},
				},
				where: { tag: { active: true, category: { active: true } } },
			},
			attributes: {
				where: { attribute: { active: true, tag: 'offers-remote-services' } },
				select: { attributeId: true },
			},
		},
	})

	const transformed = result.map(({ id, serviceName, services, attributes }) => ({
		id,
		serviceName: serviceName
			? { tsKey: serviceName.tsKey, tsNs: serviceName.ns, defaultText: serviceName.tsKey.text }
			: null,
		serviceCategories: [...new Set(services.map(({ tag }) => tag.category.tsKey))].sort(),
		offersRemote: attributes.length > 0,
	}))
	return transformed
}
