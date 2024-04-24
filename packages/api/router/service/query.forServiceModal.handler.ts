import { prisma } from '@weareinreach/db'
import { formatAttributes } from '~api/formatters/attributes'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForServiceModalSchema } from './query.forServiceModal.schema'

export const forServiceModal = async ({ input }: TRPCHandlerParams<TForServiceModalSchema>) => {
	const result = await prisma.orgService.findUniqueOrThrow({
		where: { id: input, ...globalWhere.isPublic() },
		select: {
			id: true,
			services: { select: { tag: { select: { tsKey: true } } }, where: { tag: { active: true } } },
			serviceName: {
				select: {
					key: true,
					ns: true,
					tsKey: {
						select: {
							text: true,
						},
					},
				},
			},
			locations: {
				where: { location: globalWhere.isPublic() },
				select: { location: { select: { country: { select: { cca2: true } } } } },
			},
			attributes: formatAttributes.prismaSelect(false),
			// 	select: {
			// 		attribute: {
			// 			select: {
			// 				id: true,
			// 				tsKey: true,
			// 				tsNs: true,
			// 				icon: true,
			// 				iconBg: true,
			// 				showOnLocation: true,
			// 				categories: { select: { category: { select: { tag: true, icon: true } } } },
			// 				_count: { select: { parents: true, children: true } },
			// 			},
			// 		},
			// 		id: true,
			// 		country: {
			// 			select: {
			// 				cca2: true,
			// 				id: true,
			// 				name: true,
			// 			},
			// 		},
			// 		language: {
			// 			select: {
			// 				languageName: true,
			// 				nativeName: true,
			// 			},
			// 		},
			// 		text: {
			// 			select: {
			// 				key: true,
			// 				ns: true,
			// 				tsKey: {
			// 					select: {
			// 						text: true,
			// 					},
			// 				},
			// 			},
			// 		},
			// 		govDist: { select: { tsKey: true, tsNs: true, abbrev: true, id: true } },
			// 		boolean: true,
			// 		data: true,
			// 	},
			// 	where: { active: true },
			// },
			hours: { where: { active: true }, select: { _count: true } },
			description: {
				select: {
					key: true,
					ns: true,
					tsKey: {
						select: {
							text: true,
						},
					},
				},
			},
		},
	})
	const { attributes, accessDetails } = formatAttributes.processAndSeparateAccessDetails(result.attributes)
	const transformed = {
		...result,
		attributes,
		accessDetails,
	}
	return transformed
}
export default forServiceModal
