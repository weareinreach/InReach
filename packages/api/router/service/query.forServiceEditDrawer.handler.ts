import { prisma } from '@weareinreach/db'
import { formatAttributes } from '~api/formatters/attributes'
import { formatHours } from '~api/formatters/hours'
import { globalSelect } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForServiceEditDrawerSchema } from './query.forServiceEditDrawer.schema'

const freeTextSelect = {
	select: { tsKey: { select: { key: true, text: true, ns: true, crowdinId: true } } },
} as const
export const forServiceEditDrawer = async ({ input }: TRPCHandlerParams<TForServiceEditDrawerSchema>) => {
	const result = await prisma.orgService.findUniqueOrThrow({
		where: { id: input },
		select: {
			id: true,
			published: true,
			deleted: true,
			attributes: formatAttributes.prismaSelect(true),
			description: freeTextSelect,
			phones: { select: { phone: { select: { id: true } } } },
			emails: { select: { email: { select: { id: true } } } },
			locations: { select: { orgLocationId: true } },
			hours: formatHours.prismaSelect(true),
			services: { select: { tag: { select: { id: true, tsKey: true, tsNs: true } } } },
			serviceAreas: {
				select: {
					id: true,
					countries: { select: { countryId: true } },
					districts: { select: { govDistId: true } },
				},
			},

			serviceName: freeTextSelect,
		},
	})
	const {
		attributes: rawAttributes,
		phones,
		emails,
		locations,
		services,
		serviceAreas,
		hours,
		description,
		serviceName,
		...rest
	} = result
	const { attributes, accessDetails } = formatAttributes.processAndSeparateAccessDetails(rawAttributes)

	const transformed = {
		...rest,
		name: serviceName?.tsKey,
		description: description?.tsKey,
		phones: phones.map(({ phone }) => phone.id),
		emails: emails.map(({ email }) => email.id),
		locations: locations.map(({ orgLocationId }) => orgLocationId),
		services: services.map(({ tag }) => tag.id),
		hours: formatHours.process(hours),
		serviceAreas: serviceAreas
			? {
					id: serviceAreas.id,
					countries: serviceAreas.countries.map(({ countryId }) => countryId),
					districts: serviceAreas.districts.map(({ govDistId }) => govDistId),
				}
			: null,
		attributes,
		accessDetails,
	}

	return transformed
}
export default forServiceEditDrawer
