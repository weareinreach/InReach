import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

import { attributes, countryWithoutGeo, govDistWithoutGeo } from './common'
import { cuid } from '../common'

const serviceInclude = z
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
	.transform((include) => {
		const query = {
			services: include.services
				? {
						select: {
							tag: {
								include: {
									defaultAttributes: {
										include: {
											attribute: true,
										},
									},
									category: true,
								},
							},
						},
				  }
				: false,
			serviceAreas: include.serviceAreas
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
				: false,
			hours: include.hours,
			reviews: include.reviews
				? {
						include: {
							language: true,
							lcrCountry: countryWithoutGeo,
							lcrGovDist: govDistWithoutGeo,
							translatedText: true,
						},
				  }
				: false,
			attributes: include.attributes ? attributes : false,
			phones: include.phones
				? {
						select: {
							phone: {
								include: {
									country: countryWithoutGeo,
									phoneLangs: true,
									phoneType: true,
								},
							},
						},
				  }
				: false,
			emails: include.emails
				? {
						select: {
							email: {
								include: {
									title: true,
								},
							},
						},
				  }
				: false,
			accessDetails: include.accessDetails
				? {
						select: {
							attributes,
						},
				  }
				: false,
			locations: include.locations,
		} satisfies Prisma.OrgServiceInclude
		return query
	})

export const serviceById = z
	.object({
		id: cuid,
		include: serviceInclude,
	})
	.transform(
		({ id, include }) =>
			({
				where: {
					id,
				},
				include,
			} satisfies Prisma.OrgServiceFindUniqueOrThrowArgs)
	)

export const serviceByOrgId = z
	.object({
		organizationId: cuid,
		include: serviceInclude.optional(),
	})
	.transform(
		({ include, organizationId }) =>
			({
				where: {
					organizationId,
				},
				include,
			} satisfies Prisma.OrgServiceFindManyArgs)
	)

export const serviceByLocationId = z
	.object({
		orgLocationId: cuid,
		include: serviceInclude.optional(),
	})
	.transform(
		({ include, orgLocationId }) =>
			({
				where: {
					locations: {
						some: {
							orgLocationId,
						},
					},
				},
				include,
			} satisfies Prisma.OrgServiceFindManyArgs)
	)

export const serviceByUserListId = z
	.object({
		listId: cuid,
		include: serviceInclude.optional(),
	})
	.transform(
		({ include, listId }) =>
			({
				where: {
					userLists: {
						some: {
							listId,
						},
					},
				},
				include,
			} satisfies Prisma.OrgServiceFindManyArgs)
	)
