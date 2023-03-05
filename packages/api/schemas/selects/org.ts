import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

import { freeText, isPublic } from './common'

type OrgIncludeKeys = z.ZodObject<
	{
		[k in keyof Omit<Prisma.OrganizationInclude, '_count'>]-?: z.ZodDefault<z.ZodBoolean>
	},
	'strip'
>
type OrgSelectKeys = {
	[k in keyof Prisma.OrganizationSelect]: z.infer<typeof boolFalse>
}

const boolFalse = z.boolean().default(false) satisfies z.ZodDefault<z.ZodBoolean>

export const orgInclude: OrgIncludeKeys = z.object({
	allowedEditors: boolFalse,
	associatedUsers: boolFalse,
	attributes: boolFalse,
	attributeSupplements: boolFalse,
	auditLogs: boolFalse,
	description: boolFalse,
	emails: boolFalse,
	hours: boolFalse,
	locations: boolFalse,
	notes: boolFalse,
	outsideApi: boolFalse,
	phones: boolFalse,
	photos: boolFalse,
	reviews: boolFalse,
	serviceAreas: boolFalse,
	services: boolFalse,
	socialMedia: boolFalse,
	source: boolFalse,
	userLists: boolFalse,
	websites: boolFalse,
})

const base = { id: true, createdAt: true, updatedAt: true }

export const organizationSelect = {
	...base,
	name: true,
	slug: true,
	published: true,
	lastVerified: true,
} satisfies Prisma.OrganizationSelect
export const countryInclude = {
	select: {
		cca2: true,
		cca3: true,
		tsKey: true,
		tsNs: true,
		dialCode: true,
		flag: true,
	},
} satisfies Prisma.CountryArgs
export const hoursSelect = {
	select: {
		dayIndex: true,
		start: true,
		end: true,
		closed: true,
	},
} satisfies Prisma.Organization$hoursArgs | Prisma.OrgLocation$hoursArgs
export const orgEmailInclude = {
	where: isPublic,
	select: {
		title: {
			select: {
				tsKey: true,
				tsNs: true,
			},
		},
		firstName: true,
		lastName: true,
		email: true,
		legacyDesc: true,
		description: freeText,
	},
} satisfies Prisma.OrgService$emailsArgs | Prisma.Organization$emailsArgs | Prisma.OrgLocation$emailsArgs

export const orgPhoneInclude = {
	select: {
		country: {
			select: {
				flag: true,
				dialCode: true,
				cca2: true,
				tsKey: true,
				tsNs: true,
			},
		},
		phoneType: true,
		number: true,
		ext: true,
		primary: true,
		locationOnly: true,
	},
} satisfies Prisma.Organization$phonesArgs | Prisma.OrgLocation$phonesArgs

export const orgSocialMediaInclude = {
	where: isPublic,
	select: {
		service: {
			select: {
				tsKey: true,
				tsNs: true,
				logoIcon: true,
				name: true,
				urlBase: true,
			},
		},
		url: true,
		username: true,
	},
} satisfies Prisma.Organization$socialMediaArgs | Prisma.OrgLocation$socialMediaArgs

export const languageSelect = {
	select: {
		languageName: true,
		nativeName: true,
	},
} satisfies Prisma.LanguageArgs

export const orgWebsiteInclude = {
	select: {
		description: freeText,
		languages: { select: { language: languageSelect } },
	},
} satisfies Prisma.Organization$websitesArgs

type AttributeInclude =
	| Prisma.Organization$attributesArgs
	| Prisma.OrgLocation$attributesArgs
	| Prisma.OrgService$attributesArgs
	| Prisma.ServiceAccess$attributesArgs

export const attributeInclude = {
	where: {
		attribute: {
			active: true,
		},
	},
	select: {
		attribute: {
			select: {
				tsKey: true,
				tsNs: true,
			},
		},
		supplement: {
			select: {
				country: countryInclude,
				language: languageSelect,
				text: freeText,
				data: true,
			},
		},
	},
} satisfies AttributeInclude

export const govDistInclude = {
	select: {
		govDistType: {
			select: {
				tsNs: true,
				tsKey: true,
			},
		},
		tsKey: true,
		tsNs: true,
		abbrev: true,
	},
} satisfies Prisma.GovDistArgs

export const serviceAreaInclude = {
	select: {
		countries: { select: { country: countryInclude } },
		districts: { select: { govDist: govDistInclude } },
	},
} satisfies Prisma.ServiceAreaArgs
const attributeDefInclude = {
	select: {
		categories: { select: { category: { select: { icon: true, ns: true, tag: true } } } },
	},
} satisfies Prisma.AttributeArgs
export const serviceTagInclude = {
	select: {
		category: {
			select: {
				tsKey: true,
				tsNs: true,
			},
		},
		defaultAttributes: { select: { attribute: attributeDefInclude } },
	},
} satisfies Prisma.ServiceTagArgs
const orgServiceTagInclude = {
	select: { tag: serviceTagInclude },
} satisfies Prisma.OrgServiceTagArgs

export const serviceAccessInclude = {
	select: { attributes: attributeInclude },
} satisfies Prisma.ServiceAccessArgs
const reviewIds = {
	where: {
		visible: true,
		deleted: false,
	},
	select: { id: true },
} satisfies Prisma.Organization$reviewsArgs | Prisma.OrgLocation$reviewsArgs | Prisma.OrgService$reviewsArgs

const orgServicePhoneInclude = {
	where: {
		phone: isPublic,
	},
	select: { phone: orgPhoneInclude },
} satisfies Prisma.OrgService$phonesArgs
const orgServiceEmailInclude = {
	where: {
		email: isPublic,
	},
	select: {
		email: { select: orgEmailInclude.select },
	},
} satisfies Prisma.OrgService$emailsArgs

export const orgServiceInclude = {
	where: isPublic,
	select: {
		description: freeText,
		hours: hoursSelect,
		attributes: attributeInclude,
		serviceAreas: serviceAreaInclude,
		services: orgServiceTagInclude,
		accessDetails: serviceAccessInclude,
		reviews: reviewIds,
		phones: orgServicePhoneInclude,
		emails: orgServiceEmailInclude,
	},
} satisfies Prisma.Organization$servicesArgs

const orgLocationEmailInclude = {
	where: {
		email: isPublic,
	},
	select: {
		email: { select: orgEmailInclude.select },
	},
} satisfies Prisma.OrgLocation$emailsArgs
const orgLocationPhoneInclude = {
	where: {
		phone: isPublic,
	},
	select: { phone: orgPhoneInclude },
} satisfies Prisma.OrgLocation$phonesArgs
const orgLocationServiceInclude = {
	where: {
		service: isPublic,
	},
	select: { service: { select: orgServiceInclude.select } },
} satisfies Prisma.OrgLocation$servicesArgs

const photoSelect = {
	where: isPublic,
	select: {
		src: true,
		height: true,
		width: true,
	},
} satisfies Prisma.OrgLocation$photosArgs

export const orgLocationInclude = {
	select: {
		govDist: govDistInclude,
		country: countryInclude,
		attributes: attributeInclude,
		emails: orgLocationEmailInclude,
		websites: orgWebsiteInclude,
		phones: orgLocationPhoneInclude,
		photos: photoSelect,
		reviews: reviewIds,
		services: orgLocationServiceInclude,
		serviceAreas: serviceAreaInclude,
		socialMedia: orgSocialMediaInclude,
		name: true,
		street1: true,
		street2: true,
		city: true,
		postCode: true,
		primary: true,
		longitude: true,
		latitude: true,
	},
} satisfies Prisma.Organization$locationsArgs

export const organizationInclude = {
	select: {
		description: freeText,
		emails: orgEmailInclude,
		locations: {
			where: isPublic,
			...orgLocationInclude,
		},
		phones: {
			where: isPublic,
			...orgPhoneInclude,
		},
		photos: photoSelect,
		services: orgServiceInclude,
		socialMedia: orgSocialMediaInclude,
		websites: orgWebsiteInclude,
		reviews: reviewIds,
		serviceAreas: serviceAreaInclude,
		hours: hoursSelect,
		attributes: attributeInclude,
		name: true,
		slug: true,
		id: true,
	},
} satisfies Pick<Prisma.OrganizationFindUniqueOrThrowArgs, 'select'>

const selectServCat = {
	select: {
		services: {
			select: {
				tag: {
					select: {
						category: {
							select: {
								id: true,
								tsKey: true,
								tsNs: true,
							},
						},
					},
				},
			},
		},
	},
}

export const orgSearchSelect = {
	id: true,
	name: true,
	slug: true,
	attributes: {
		select: {
			attribute: {
				select: {
					categories: {
						where: {
							category: {
								tag: {
									in: ['organization-leadership', 'organization-focus'],
								},
							},
						},
						select: {
							attribute: {
								select: {
									tsKey: true,
									tsNs: true,
									key: {
										select: {
											text: true,
										},
									},
								},
							},
						},
					},
				},
			},
		},
	},
	description: freeText,
	services: selectServCat,
	locations: {
		select: {
			services: {
				select: {
					service: selectServCat,
				},
			},
		},
	},
} satisfies Prisma.OrganizationSelect

type Include<T> = { include: T }
type Select<T> = { select: T }
