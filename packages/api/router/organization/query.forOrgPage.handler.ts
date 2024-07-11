import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { attributes, freeText, isPublic } from '~api/schemas/selects/common'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForOrgPageSchema } from './query.forOrgPage.schema'
import { formatAddressVisiblity } from '../location/lib.formatAddressVisibility'

const forOrgPage = async ({ input }: TRPCHandlerParams<TForOrgPageSchema>) => {
	try {
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
						addressVisibility: true,
						latitude: true,
						longitude: true,
					},
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
	} catch (err) {
		return handleError(err)
	}
}
export default forOrgPage
