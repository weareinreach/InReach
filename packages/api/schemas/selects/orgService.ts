import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

import {
	attributes,
	countryWithoutGeo,
	govDistWithoutGeo,
	isPublic,
	languageNames,
	phoneSelectPublic,
	freeText,
} from './common'
import { idString } from '../common'

const defaultSelect = {
	services: true,
	serviceAreas: true,
	hours: true,
	reviews: true,
	attributes: true,
	phones: true,
	emails: true,
	accessDetails: true,
	locations: true,
}

const serviceSelect = z
	.object({
		services: z.boolean().default(true),
		serviceAreas: z.boolean().default(true),
		hours: z.boolean().default(true),
		reviews: z.boolean().default(true),
		attributes: z.boolean().default(true),
		phones: z.boolean().default(true),
		emails: z.boolean().default(true),
		accessDetails: z.boolean().default(true),
		locations: z.boolean().default(true),
	})
	.partial()
	.transform((select) => {
		const query = {
			serviceName: freeText,
			services: select.services
				? {
						where: {
							tag: {
								active: true,
							},
						},
						select: {
							tag: {
								select: {
									defaultAttributes: {
										select: {
											attribute: {
												select: {
													tsKey: true,
													tsNs: true,
												},
											},
										},
									},
									category: {
										select: {
											tsKey: true,
											tsNs: true,
										},
									},
									tsKey: true,
									tsNs: true,
									active: true,
								},
							},
						},
				  }
				: undefined,
			serviceAreas: select.serviceAreas
				? {
						select: {
							countries: {
								select: {
									country: countryWithoutGeo,
								},
							},
							districts: {
								select: {
									govDist: govDistWithoutGeo,
								},
							},
						},
				  }
				: undefined,
			hours: select.hours
				? {
						select: {
							dayIndex: true,
							start: true,
							end: true,
							closed: true,
						},
				  }
				: undefined,
			reviews: select.reviews
				? {
						where: {
							visible: true,
							deleted: false,
						},
						select: {
							language: languageNames,
							lcrCountry: countryWithoutGeo,
							lcrGovDist: govDistWithoutGeo,
							translatedText: {
								select: {
									text: true,
									language: {
										select: {
											localeCode: true,
										},
									},
								},
							},
						},
				  }
				: undefined,
			attributes: select.attributes ? attributes : undefined,
			phones: select.phones ? phoneSelectPublic : undefined,
			emails: select.emails
				? {
						where: {
							email: isPublic,
						},
						select: {
							email: {
								include: {
									title: {
										select: {
											tsKey: true,
											tsNs: true,
										},
									},
								},
							},
						},
				  }
				: undefined,
			accessDetails: select.accessDetails
				? {
						select: {
							attributes,
						},
				  }
				: undefined,
			locations: select.locations
				? {
						where: {
							location: isPublic,
						},
						select: {
							location: {
								select: {
									name: true,
									street1: true,
									street2: true,
									city: true,
									postCode: true,
									primary: true,
									govDist: govDistWithoutGeo,
									country: countryWithoutGeo,
									longitude: true,
									latitude: true,
								},
							},
						},
				  }
				: undefined,
		} satisfies Prisma.OrgServiceSelect
		return query
	})

export const serviceById = z
	.object({
		id: idString,
		select: serviceSelect.default(defaultSelect),
	})
	.transform(
		({ id, select }) =>
			({
				where: {
					id,
				},
				select,
			} satisfies Prisma.OrgServiceFindUniqueOrThrowArgs)
	)

export const serviceByOrgId = z
	.object({
		organizationId: idString,
		select: serviceSelect.default(defaultSelect),
	})
	.transform(
		({ select, organizationId }) =>
			({
				where: {
					organizationId,
				},
				select,
			} satisfies Prisma.OrgServiceFindManyArgs)
	)

export const serviceByLocationId = z
	.object({
		orgLocationId: idString,
		select: serviceSelect.optional(),
	})
	.transform(
		({ select, orgLocationId }) =>
			({
				where: {
					locations: {
						some: {
							orgLocationId,
						},
					},
				},
				select,
			} satisfies Prisma.OrgServiceFindManyArgs)
	)

export const serviceByUserListId = z
	.object({
		listId: idString,
		select: serviceSelect.optional(),
	})
	.transform(
		({ select, listId }) =>
			({
				where: {
					userLists: {
						some: {
							listId,
						},
					},
				},
				select,
			} satisfies Prisma.OrgServiceFindManyArgs)
	)
