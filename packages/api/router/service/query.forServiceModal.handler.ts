import { prisma } from '@weareinreach/db'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForServiceModalSchema } from './query.forServiceModal.schema'
import { select } from './selects'

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
			attributes: { select: select.attributes() },
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

	const transformed = {
		...result,
		attributes: result.attributes
			.filter(({ attribute }) =>
				attribute.categories.every(({ category }) => category.tag !== 'service-access-instructions')
			)
			.map(({ attribute, ...supplement }) => ({
				attribute,
				supplement,
			})),
		accessDetails: result.attributes
			.filter(({ attribute }) =>
				attribute.categories.some(({ category }) => category.tag === 'service-access-instructions')
			)
			.map(({ attribute, ...supplement }) => ({
				attribute,
				supplement,
			})),
	}
	return transformed
}
export default forServiceModal
