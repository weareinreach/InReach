import { z } from 'zod'

import { type Prisma } from '@weareinreach/db'

import {
	attributes,
	attributesByName,
	countryWithoutGeo,
	freeText,
	govDistWithoutGeo,
	isPublic,
	languageNames,
	phoneSelectPublic,
} from './common'

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

const serviceSelect = {
	serviceName: freeText,
	services: {
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
	},
	serviceAreas: {
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
	},
	hours: {
		select: {
			dayIndex: true,
			start: true,
			end: true,
			closed: true,
			tz: true,
		},
	},
	reviews: {
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
	},
	attributes: attributes,
	phones: phoneSelectPublic,
	emails: {
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
	},
	accessDetails: {
		select: {
			attributes,
		},
	},
	locations: {
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
	},
	id: true,
	description: freeText,
} satisfies Prisma.OrgServiceSelect

export const serviceById = z
	.object({
		id: z.string(),
	})
	.transform(
		({ id }) =>
			({
				where: {
					id,
				},
				select: serviceSelect,
			} satisfies Prisma.OrgServiceFindUniqueOrThrowArgs)
	)

export const serviceByOrgId = z
	.object({
		organizationId: z.string(),
	})
	.transform(
		({ organizationId }) =>
			({
				where: { organizationId },
				select: {
					id: true,
					attributes: attributesByName(['offers-remote-services']),
					serviceName: freeText,

					services: {
						where: { tag: { active: true } },
						select: {
							tag: {
								select: {
									category: { select: { tsKey: true, tsNs: true } },
									tsKey: true,
									tsNs: true,
									active: true,
								},
							},
						},
					},

					locations: {
						where: { location: isPublic },
						select: {
							location: {
								select: {
									name: true,
								},
							},
						},
					},
				},
			} satisfies Prisma.OrgServiceFindManyArgs)
	)

export const serviceByLocationId = z
	.object({
		orgLocationId: z.string(),
	})
	.transform(
		({ orgLocationId }) =>
			({
				where: {
					locations: {
						some: {
							orgLocationId,
						},
					},
				},
				select: serviceSelect,
			} satisfies Prisma.OrgServiceFindManyArgs)
	)

export const serviceByUserListId = z
	.object({
		listId: z.string(),
	})
	.transform(
		({ listId }) =>
			({
				where: {
					userLists: {
						some: {
							listId,
						},
					},
				},
				select: serviceSelect,
			} satisfies Prisma.OrgServiceFindManyArgs)
	)

export const forServiceDrawer = z
	.object({
		organizationId: z.string(),
	})
	.transform(
		({ organizationId }) =>
			({
				where: { organizationId },
				select: {
					id: true,
					attributes: attributesByName(['offers-remote-services']),
					serviceName: freeText,

					services: {
						where: { tag: { active: true } },
						select: {
							tag: {
								select: {
									category: { select: { tsKey: true, tsNs: true, id: true } },
									tsKey: true,
									tsNs: true,
									active: true,
								},
							},
						},
					},

					locations: {
						where: { location: isPublic },
						select: {
							location: {
								select: {
									name: true,
								},
							},
						},
					},
				},
			} satisfies Prisma.OrgServiceFindManyArgs)
	)
