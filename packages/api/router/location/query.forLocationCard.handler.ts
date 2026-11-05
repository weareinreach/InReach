import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { formatAddressVisiblity } from './lib.formatAddressVisibility'
import { type TForLocationCardSchema } from './query.forLocationCard.schema'
import { DATA_PORTAL_PERMISSIONS } from '../organization/lib/createOrgSuggestion'

const forLocationCard = async ({ input, ctx }: TRPCHandlerParams<TForLocationCardSchema>) => {
	try {
		const { id, isEditMode } = input

		// Previously `!!ctx.session?.user?.permissions` - `permissions` is always a (possibly empty) array for
		// any signed-in session, so this was true for any logged-in user, not just staff. Any registered
		// account could pass isEditMode: true and see a hidden location's full address/phone numbers.
		const canSeeAll = Boolean(
			isEditMode && ctx.session?.user?.permissions.some((p) => DATA_PORTAL_PERMISSIONS.includes(p))
		)

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
			// Staff in edit mode see a HIDDEN address's city/district, like forVisitCardEdits (#2011). Keyed on
			// `canSeeAll`, not the caller-supplied `isEditMode`, so a public request can't unmask it.
			...formatAddressVisiblity(result, canSeeAll),
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
