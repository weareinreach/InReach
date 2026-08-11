import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { formatAddressVisiblity } from './lib.formatAddressVisibility'
import { type TForVisitCardEditsSchema } from './query.forVisitCardEdits.schema'

const forVisitCardEdits = async ({ input }: TRPCHandlerParams<TForVisitCardEditsSchema>) => {
	try {
		const result = await prisma.orgLocation.findUnique({
			where: {
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
			},
		})
		if (!result) {
			return null
		}
		const formattedAddress = formatAddressVisiblity(result, true)

		const { attributes, ...rest } = result
		const transformed = {
			...rest,
			...formattedAddress,
			remote: attributes.find(({ attribute }) => attribute.tag === 'offers-remote-services')?.attribute,
			accessible: attributes.find(({ attribute }) => attribute.tag === 'wheelchair-accessible')?.boolean,
		}
		return transformed
	} catch (err) {
		return handleError(err)
	}
}
export default forVisitCardEdits
