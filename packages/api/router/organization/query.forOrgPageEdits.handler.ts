import { prisma } from '@weareinreach/db'
import { attributes, freeText } from '~api/schemas/selects/common'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForOrgPageEditsSchema } from './query.forOrgPageEdits.schema'

export const forOrgPageEdits = async ({ input }: TRPCHandlerParams<TForOrgPageEditsSchema>) => {
	const { slug } = input
	const org = await prisma.organization.findUniqueOrThrow({
		where: {
			slug,
		},
		select: {
			id: true,
			name: true,
			slug: true,
			published: true,
			deleted: true,
			lastVerified: true,
			allowedEditors: { where: { authorized: true }, select: { userId: true } },
			description: freeText,
			attributes,
			reviews: {
				select: { id: true },
			},
			locations: {
				select: {
					id: true,
					street1: true,
					street2: true,
					city: true,
					postCode: true,
					country: { select: { cca2: true } },
					govDist: { select: { abbrev: true, tsKey: true, tsNs: true } },
				},
			},
		},
	})
	const { allowedEditors, ...orgData } = org
	const reformatted = {
		...orgData,
		isClaimed: Boolean(allowedEditors.length),
	}

	return reformatted
}
