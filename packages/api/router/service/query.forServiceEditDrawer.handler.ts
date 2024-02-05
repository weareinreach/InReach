import { prisma } from '@weareinreach/db'
import { transformer } from '@weareinreach/util/transformer'
import { globalSelect } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForServiceEditDrawerSchema } from './query.forServiceEditDrawer.schema'

export const forServiceEditDrawer = async ({ input }: TRPCHandlerParams<TForServiceEditDrawerSchema>) => {
	const result = await prisma.orgService.findUniqueOrThrow({
		where: { id: input },
		select: {
			id: true,
			attributes: {
				select: {
					attribute: {
						select: {
							id: true,
							tsKey: true,
							tsNs: true,
							icon: true,
							categories: { select: { category: { select: { tag: true } } } },
						},
					},

					id: true,
					active: true,
					data: true,
					boolean: true,
					countryId: true,
					govDistId: true,
					languageId: true,
					text: globalSelect.freeText({ withCrowdinId: true }),
				},
			},
			description: globalSelect.freeText({ withCrowdinId: true }),
			phones: { select: { phone: { select: { id: true } } } },
			emails: { select: { email: { select: { id: true } } } },
			locations: { select: { location: { select: { id: true } } } },
			hours: { select: { id: true, dayIndex: true, start: true, end: true, closed: true, tz: true } },
			services: { select: { tag: { select: { id: true, primaryCategoryId: true } } } },
			serviceAreas: {
				select: {
					id: true,
					countries: { select: { country: { select: { id: true } } } },
					districts: { select: { govDist: { select: { id: true } } } },
				},
			},
			published: true,
			deleted: true,
			serviceName: globalSelect.freeText({ withCrowdinId: true }),
		},
	})
	const { attributes, phones, emails, locations, services, serviceAreas, ...rest } = result
	const transformed = {
		...rest,
		phones: phones.map(({ phone }) => phone.id),
		emails: emails.map(({ email }) => email.id),
		locations: locations.map(({ location }) => location.id),
		services: services.map(({ tag }) => ({ id: tag.id, primaryCategoryId: tag.primaryCategoryId })),
		serviceAreas: serviceAreas
			? {
					id: serviceAreas.id,
					countries: serviceAreas.countries.map(({ country }) => country.id),
					districts: serviceAreas.districts.map(({ govDist }) => govDist.id),
				}
			: null,
		attributes: attributes
			.filter(({ attribute }) =>
				attribute.categories.every(({ category }) => category.tag !== 'service-access-instructions')
			)
			.map(({ attribute, ...supplement }) => {
				const { categories, ...attr } = attribute
				return {
					attribute: { ...attr, categories: categories.map(({ category }) => category.tag) },
					supplement,
				}
			}),
		accessDetails: attributes
			.filter(({ attribute }) =>
				attribute.categories.some(({ category }) => category.tag === 'service-access-instructions')
			)
			.map(({ attribute, ...supplement }) => ({
				attribute,
				supplement,
			})),
	}

	return transformed
}
export default forServiceEditDrawer
