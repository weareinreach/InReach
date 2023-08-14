import { prisma } from '@weareinreach/db'
import { transformer } from '~api/lib/transformer'
import { globalSelect } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForServiceEditDrawerSchema } from './query.forServiceEditDrawer.schema'

export const forServiceEditDrawer = async ({ input }: TRPCHandlerParams<TForServiceEditDrawerSchema>) => {
	const result = await prisma.orgService.findUniqueOrThrow({
		where: { id: input },
		select: {
			id: true,
			accessDetails: {
				select: {
					attribute: { select: { id: true, tsKey: true, tsNs: true } },
					supplement: {
						select: { id: true, text: globalSelect.freeText({ withCrowdinId: true }), data: true },
					},
				},
			},
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
					supplement: {
						select: {
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
				},
			},
			description: globalSelect.freeText({ withCrowdinId: true }),
			phones: { select: { phone: { select: { id: true } } } },
			emails: { select: { email: { select: { id: true } } } },
			locations: { select: { location: { select: { id: true } } } },
			hours: { select: { id: true, dayIndex: true, start: true, end: true, closed: true, tz: true } },
			services: { select: { tag: { select: { id: true, categoryId: true } } } },
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
	const { attributes, phones, emails, locations, services, serviceAreas, accessDetails, ...rest } = result
	const transformed = {
		...rest,
		phones: phones.map(({ phone }) => phone.id),
		emails: emails.map(({ email }) => email.id),
		locations: locations.map(({ location }) => location.id),
		services: services.map(({ tag }) => ({ id: tag.id, categoryId: tag.categoryId })),
		serviceAreas: serviceAreas
			? {
					id: serviceAreas.id,
					countries: serviceAreas.countries.map(({ country }) => country.id),
					districts: serviceAreas.districts.map(({ govDist }) => govDist.id),
			  }
			: null,
		attributes: attributes.map(({ attribute, supplement }) => {
			const { categories, ...attr } = attribute
			return {
				attribute: { ...attr, categories: categories.map(({ category }) => category.tag) },
				supplement: supplement.map(({ data, ...rest }) => {
					if (data) {
						return { ...rest, data: transformer.parse(JSON.stringify(data)) }
					}
					return { ...rest, data }
				}),
			}
		}),
		accessDetails: accessDetails.map(({ attribute, supplement }) => ({
			attribute,
			supplement: supplement.map(({ data, ...rest }) => {
				if (data) {
					return { ...rest, data: transformer.parse(JSON.stringify(data)) }
				}
				return { ...rest, data }
			}),
		})),
	}

	return transformed
}
