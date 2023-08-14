import { prisma } from '@weareinreach/db'
import { globalSelect, globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TByOrgIdSchema } from './query.byOrgId.schema'
import { select } from './selects'

export const byOrgId = async ({ input }: TRPCHandlerParams<TByOrgIdSchema>) => {
	const results = await prisma.orgService.findMany({
		where: input,
		select: {
			id: true,
			attributes: {
				where: { active: true, attribute: globalWhere.attributesByTag(['offers-remote-services']) },
				select: select.attributes(),
			},
			serviceName: globalSelect.freeText(),

			services: {
				where: { tag: { active: true } },
				select: {
					tag: {
						select: {
							category: { select: { tsKey: true, tsNs: true } },
							tsKey: true,
							tsNs: true,
							active: true,
						},
					},
				},
			},

			locations: {
				where: { location: globalWhere.isPublic() },
				select: {
					location: {
						select: {
							name: true,
						},
					},
				},
			},
		},
	})
	return results
}
