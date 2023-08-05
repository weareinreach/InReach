import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetAddressSchema } from './query.getAddress.schema'

export const getAddress = async ({ input }: TRPCHandlerParams<TGetAddressSchema>) => {
	try {
		const result = await prisma.orgLocation.findUniqueOrThrow({
			where: { id: input },
			select: {
				id: true,
				name: true,
				street1: true,
				street2: true,
				city: true,
				postCode: true,
				govDistId: true,
				countryId: true,
				attributes: {
					select: {
						attribute: { select: { id: true, tsKey: true, tsNs: true } },
						supplement: { select: { id: true, boolean: true } },
					},
					where: { attribute: { tag: 'wheelchair-accessible' } },
				},
				latitude: true,
				longitude: true,
				mailOnly: true,
				published: true,
				services: { select: { serviceId: true } },
			},
		})
		const { id, attributes, services, ...rest } = result

		const accessibleAttribute = attributes.find(({ supplement }) => Boolean(supplement.length))
		const { id: supplementId, boolean } = accessibleAttribute
			? accessibleAttribute.supplement.find(({ id }) => Boolean(id)) ?? {}
			: { id: undefined, boolean: undefined }

		const transformedResult = {
			id,
			data: {
				...rest,
				accessible: {
					supplementId,
					boolean,
				},
				services: services.map(({ serviceId }) => serviceId),
			},
		}

		return transformedResult
	} catch (error) {
		handleError(error)
	}
}
