import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

type OrgIncludeKeys = z.ZodObject<{
	[k in keyof Omit<Prisma.OrganizationInclude, '_count'>]-?: z.ZodDefault<z.ZodBoolean>
}>
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

export const organizationSelect: Prisma.OrganizationSelect = {
	...base,
	name: true,
	slug: true,
	published: true,
	lastVerified: true,
}
export const countryInclude: Prisma.CountryArgs = {
	select: {
		cca2: true,
		cca3: true,
		tsKey: true,
		tsNs: true,
		dialCode: true,
		flag: true,
	},
}
export const hoursSelect: Prisma.OrgHoursArgs = {
	select: {
		dayIndex: true,
		start: true,
		end: true,
		closed: true,
	},
}
export const orgEmailInclude: Prisma.OrgEmailArgs = {
	include: {
		title: true,
	},
}

export const orgPhoneInclude: Prisma.OrgPhoneArgs = {
	include: {
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
	},
}

export const orgSocialMediaInclude: Prisma.OrgSocialMediaArgs = {
	include: {
		service: true,
	},
}

export const orgWebsiteInclude: Prisma.OrgWebsiteArgs = {
	include: {
		description: true,
		languages: true,
	},
}

type AttributeInclude =
	| Prisma.OrganizationAttributeArgs
	| Prisma.LocationAttributeArgs
	| Prisma.ServiceAttributeArgs
	| Prisma.ServiceAccessAttributeArgs

export const attributeInclude: AttributeInclude = {
	include: {
		attribute: true,
		supplement: {
			include: {
				country: countryInclude,
				language: true,
				text: true,
			},
		},
	},
}

export const govDistInclude: Prisma.GovDistArgs = {
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

		// subDistricts: {
		// 	select: {
		// 		govDistType: {
		// 			select: {
		// 				tsNs: true,
		// 				tsKey: true,
		// 			},
		// 		},
		// 		tsKey: true,
		// 		tsNs: true,
		// 		abbrev: true,
		// 	},
		// },
	},
}

export const serviceAreaInclude: Prisma.ServiceAreaArgs = {
	include: {
		countries: { include: { country: countryInclude } },
		districts: { include: { govDist: govDistInclude } },
	},
}
const attributeDefInclude: Prisma.AttributeArgs = {
	include: {
		categories: { include: { category: true } },
	},
}
export const serviceTagInclude: Prisma.ServiceTagArgs = {
	include: {
		category: true,
		defaultAttributes: { include: { attribute: attributeDefInclude } },
	},
}
const orgServiceTagInclude: Prisma.OrgServiceTagArgs = {
	include: { tag: serviceTagInclude },
}

export const serviceAccessInclude: Prisma.ServiceAccessArgs = {
	include: { attributes: attributeInclude },
}
const reviewIds: Prisma.OrgReviewArgs = { select: { id: true } }

const orgServicePhoneInclude: Prisma.OrgServicePhoneArgs = {
	include: { phone: orgPhoneInclude },
}
const orgServiceEmailInclude: Prisma.OrgServiceEmailArgs = {
	include: { email: orgEmailInclude },
}

export const orgServiceInclude: Include<Prisma.OrgServiceInclude> = {
	include: {
		description: true,
		hours: hoursSelect,
		attributes: attributeInclude,
		serviceAreas: serviceAreaInclude,
		services: orgServiceTagInclude,
		accessDetails: serviceAccessInclude,
		reviews: reviewIds,
		phones: orgServicePhoneInclude,
		emails: orgServiceEmailInclude,
	},
}

const orgLocationEmailInclude: Prisma.OrgLocationEmailArgs = {
	include: { email: orgEmailInclude },
}
const orgLocationPhoneInclude: Prisma.OrgLocationPhoneArgs = {
	include: { phone: orgPhoneInclude },
}
const orgLocationServiceInclude: Prisma.OrgLocationServiceArgs = {
	include: { service: orgServiceInclude },
}

export const orgLocationInclude: Include<Prisma.OrgLocationInclude> = {
	include: {
		govDist: govDistInclude,
		country: countryInclude,
		attributes: attributeInclude,
		emails: orgLocationEmailInclude,
		websites: orgWebsiteInclude,
		phones: orgLocationPhoneInclude,
		photos: true,
		reviews: reviewIds,
		services: orgLocationServiceInclude,
		serviceAreas: serviceAreaInclude,
		socialMedia: orgSocialMediaInclude,
	},
}

export const organizationInclude: Include<Prisma.OrganizationInclude> = {
	include: {
		description: true,
		emails: orgEmailInclude,
		locations: orgLocationInclude,
		phones: orgPhoneInclude,
		photos: true,
		services: orgServiceInclude,
		socialMedia: orgSocialMediaInclude,
		websites: orgWebsiteInclude,
		reviews: reviewIds,
		serviceAreas: serviceAreaInclude,
		hours: hoursSelect,
		attributes: attributeInclude,
	},
}

type Include<T> = { include: T }
