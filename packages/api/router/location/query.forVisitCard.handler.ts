import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { formatAddressVisiblity } from './lib.formatAddressVisibility'
import { type TForVisitCardSchema } from './query.forVisitCard.schema'

const forVisitCard = async ({ input }: TRPCHandlerParams<TForVisitCardSchema>) => {
	try {
		const result = await prisma.orgLocation.findUnique({
			where: {
				...globalWhere.isPublic(),
				id: input,
			},
			select: {
				id: true,
				name: true,
				street1: true,
				street2: true,
				city: true,
				postCode: true,
				country: { select: { cca2: true } },
				govDist: { select: { abbrev: true, tsKey: true, tsNs: true } },
				attributes: {
					where: { attribute: { tag: { in: ['offers-remote-services', 'wheelchair-accessible'] } } },
					select: { attribute: { select: { tag: true, tsKey: true, icon: true } }, boolean: true },
				},
				latitude: true,
				longitude: true,
				addressVisibility: true,
				hours: { where: { active: true }, select: { id: true } },
			},
		})
		if (!result) {
			return null
		}
		const { attributes, hours, ...rest } = result
		const transformed = {
			...rest,
			...formatAddressVisiblity(rest),
			remote: attributes.find(({ attribute }) => attribute.tag === 'offers-remote-services')?.attribute,
			accessible: attributes.find(({ attribute }) => attribute.tag === 'wheelchair-accessible')?.boolean,
			hasHours: hours.length > 0,
		}
		return transformed
	} catch (err) {
		return handleError(err)
	}
}
export default forVisitCard
