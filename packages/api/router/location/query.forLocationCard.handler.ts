import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { formatAddressVisiblity } from './lib.formatAddressVisibility'
import { type TForLocationCardSchema } from './query.forLocationCard.schema'

const forLocationCard = async ({ input, ctx }: TRPCHandlerParams<TForLocationCardSchema>) => {
	try {
		const { id, isEditMode } = input

		const canSeeAll = isEditMode && !!ctx.session?.user?.permissions

		const result = await prisma.orgLocation.findUniqueOrThrow({
			where: {
				id,
				...(!canSeeAll && globalWhere.isPublic()),
			},
			select: {
				id: true,
				name: true,
				street1: true,
				street2: true,
				city: true,
				postCode: true,
				latitude: true,
				longitude: true,
				addressVisibility: true,
				published: true,
				deleted: true,
				country: { select: { cca2: true } },
				govDist: { select: { abbrev: true, tsKey: true, tsNs: true } },
				phones: {
					...(!canSeeAll && { where: { phone: globalWhere.isPublic() } }),
					select: { phone: { select: { primary: true, number: true, country: { select: { cca2: true } } } } },
				},
				attributes: {
					select: {
						attribute: { select: { tsNs: true, tsKey: true, icon: true, tag: true } },
						boolean: true,
					},
				},
				services: {
					select: {
						service: {
							select: {
								services: { select: { tag: { select: { primaryCategory: { select: { tsKey: true } } } } } },
							},
						},
					},
				},
			},
		})

		const transformed = {
			...result,
			...formatAddressVisiblity(result),
			country: result.country.cca2,
			phones: result.phones.map(({ phone }) => ({ ...phone, country: phone.country.cca2 })),
			attributes: result.attributes
				.filter(({ attribute }) => attribute.tag !== 'wheelchair-accessible')
				.map(({ attribute }) => ({ tsNs: attribute.tsNs, tsKey: attribute.tsKey, icon: attribute.icon })),
			accessible: result.attributes.find(({ attribute }) => attribute.tag === 'wheelchair-accessible')
				?.boolean,
			services: [
				...new Set(
					result.services.flatMap(({ service }) =>
						service.services.map(({ tag }) => tag.primaryCategory.tsKey)
					)
				),
			],
		}

		return transformed
	} catch (err) {
		return handleError(err)
	}
}
export default forLocationCard
