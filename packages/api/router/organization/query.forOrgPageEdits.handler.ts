import { prisma } from '@weareinreach/db'
import { attributes, freeText } from '~api/schemas/selects/common'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForOrgPageEditsSchema } from './query.forOrgPageEdits.schema'
import { formatAddressVisiblity } from '../location/lib.formatAddressVisibility'

const forOrgPageEdits = async ({ input }: TRPCHandlerParams<TForOrgPageEditsSchema>) => {
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
					addressVisibility: true,
					latitude: true,
					longitude: true,
				},
				orderBy: [{ deleted: 'asc' }, { published: 'desc' }, { createdAt: 'desc' }],
			},
			attributes,
		},
	})
	const { allowedEditors, locations, ...orgData } = org
	const reformatted = {
		...orgData,
		locations: locations.map((location) => ({ ...location, ...formatAddressVisiblity(location) })),
		isClaimed: Boolean(allowedEditors.length),
	}

	return reformatted
}
export default forOrgPageEdits
