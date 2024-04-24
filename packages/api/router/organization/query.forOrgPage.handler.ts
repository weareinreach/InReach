import { prisma } from '@weareinreach/db'
import { attributes, freeText, isPublic } from '~api/schemas/selects/common'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForOrgPageSchema } from './query.forOrgPage.schema'

const forOrgPage = async ({ ctx, input }: TRPCHandlerParams<TForOrgPageSchema>) => {
	const { slug } = input
	const org = await prisma.organization.findUniqueOrThrow({
		where: {
			slug,
			...isPublic,
		},
		select: {
			id: true,
			name: true,
			slug: true,
			published: true,
			lastVerified: true,
			allowedEditors: { where: { authorized: true }, select: { userId: true } },
			description: freeText,
			userLists: ctx.session?.user.id
				? {
						where: { list: { ownedById: ctx.session.user.id } },
						select: { list: { select: { id: true, name: true } } },
					}
				: undefined,

			reviews: {
				where: { visible: true, deleted: false },
				select: { id: true },
			},
			locations: {
				where: isPublic,
				select: {
					id: true,
					street1: true,
					street2: true,
					city: true,
					postCode: true,
					country: { select: { cca2: true } },
					govDist: { select: { abbrev: true, tsKey: true, tsNs: true } },
					notVisitable: true,
				},
			},
			attributes,
		},
	})
	const { allowedEditors, ...orgData } = org
	const reformatted = {
		...orgData,
		isClaimed: Boolean(allowedEditors.length),
	}

	return reformatted
}
export default forOrgPage
