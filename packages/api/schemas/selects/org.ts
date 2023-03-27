import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

import { Context } from '~api/lib'

import { freeText, isPublic, attributes } from './common'

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
const countryInclude = {
	select: {
		cca2: true,
		cca3: true,
		tsKey: true,
		tsNs: true,
		dialCode: true,
		flag: true,
	},
} satisfies Prisma.CountryArgs
const hoursSelect = {
	select: {
		dayIndex: true,
		start: true,
		end: true,
		closed: true,
		tz: true,
	},
} satisfies Prisma.Organization$hoursArgs | Prisma.OrgLocation$hoursArgs
const orgEmailInclude = {
	where: { email: isPublic },
	select: {
		email: {
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
				primary: true,
			},
		},
	},
} satisfies Prisma.OrgService$emailsArgs | Prisma.Organization$emailsArgs | Prisma.OrgLocation$emailsArgs

const orgPhoneInclude = {
	where: {
		phone: isPublic,
	},

	select: {
		phone: {
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
		},
	},
} satisfies Prisma.Organization$phonesArgs | Prisma.OrgLocation$phonesArgs

const orgSocialMediaInclude = {
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

const languageSelect = {
	select: {
		languageName: true,
		nativeName: true,
	},
} satisfies Prisma.LanguageArgs

const orgWebsiteInclude = {
	select: {
		id: true,
		description: freeText,
		languages: { select: { language: languageSelect } },
		url: true,
		isPrimary: true,
		orgLocationId: true,
		orgLocationOnly: true,
	},
} satisfies Prisma.Organization$websitesArgs

type AttributeInclude =
	| Prisma.Organization$attributesArgs
	| Prisma.OrgLocation$attributesArgs
	| Prisma.OrgService$attributesArgs
	| Prisma.ServiceAccess$attributesArgs

const attributeInclude = attributes satisfies AttributeInclude

const govDistInclude = {
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

const serviceAreaInclude = {
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
const serviceTagInclude = {
	select: {
		name: true,
		tsKey: true,
		tsNs: true,
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

const serviceAccessInclude = {
	select: { attributes: attributeInclude },
} satisfies Prisma.ServiceAccessArgs
const reviewIds = {
	where: {
		visible: true,
		deleted: false,
	},
	select: { id: true },
} satisfies Prisma.Organization$reviewsArgs | Prisma.OrgLocation$reviewsArgs | Prisma.OrgService$reviewsArgs

const orgServiceInclude = (ctx: Context) =>
	({
		where: isPublic,
		select: {
			serviceName: freeText,
			description: freeText,
			hours: hoursSelect,
			attributes: attributeInclude,
			serviceAreas: serviceAreaInclude,
			services: orgServiceTagInclude,
			accessDetails: serviceAccessInclude,
			reviews: reviewIds,
			phones: orgPhoneInclude,
			emails: orgEmailInclude,
			userLists: userListSelect(ctx),
			id: true,
		},
	} satisfies Prisma.Organization$servicesArgs)

const orgLocationServiceInclude = (ctx: Context) =>
	({
		where: {
			service: isPublic,
		},
		select: { service: { select: orgServiceInclude(ctx).select } },
	} satisfies Prisma.OrgLocation$servicesArgs)

const photoSelect = {
	where: isPublic,
	select: {
		src: true,
		height: true,
		width: true,
	},
} satisfies Prisma.OrgLocation$photosArgs

const userListSelect = (ctx: Context) => {
	if (!ctx.session?.user.id) return undefined
	return {
		where: {
			list: {
				ownedById: ctx.session?.user.id,
			},
		},
		select: {
			list: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	}
}

export const orgLocationInclude = (ctx: Context) =>
	({
		select: {
			govDist: govDistInclude,
			country: countryInclude,
			attributes: attributeInclude,
			emails: orgEmailInclude,
			websites: orgWebsiteInclude,
			phones: orgPhoneInclude,
			photos: photoSelect,
			hours: hoursSelect,
			reviews: reviewIds,
			services: orgLocationServiceInclude(ctx),
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
			id: true,
		},
	} satisfies Prisma.Organization$locationsArgs)

export const organizationInclude = (ctx: Context) =>
	({
		select: {
			description: freeText,
			emails: orgEmailInclude,
			locations: orgLocationInclude(ctx),
			phones: orgPhoneInclude,
			photos: photoSelect,
			services: orgServiceInclude(ctx),
			socialMedia: orgSocialMediaInclude,
			websites: orgWebsiteInclude,
			reviews: reviewIds,
			serviceAreas: serviceAreaInclude,
			hours: hoursSelect,
			attributes: attributeInclude,
			userLists: userListSelect(ctx),
			allowedEditors: {
				where: { authorized: true },
				select: { _count: true },
			},
			name: true,
			slug: true,
			id: true,
			lastVerified: true,
		},
	} satisfies Pick<Prisma.OrganizationFindUniqueOrThrowArgs, 'select'>)

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
const selectAttrib = {
	where: {
		attribute: {
			active: true,
			categories: {
				some: {
					category: {
						OR: [{ tag: 'organization-leadership' }, { tag: 'organization-focus' }],
					},
				},
			},
		},
	},
	select: {
		attribute: {
			select: {
				id: true,
				tsKey: true,
				icon: true,
				iconBg: true,
				categories: {
					where: { category: { active: true } },
					select: { category: { select: { tag: true } } },
				},
			},
		},
		// supplement: {
		// 	where: {
		// 		active: true,
		// 	},
		// 	select: {
		// 		id: true,
		// 		boolean: true,
		// 		countryId: true,
		// 		languageId: true,
		// 		govDistId: true,
		// 		text: {
		// 			select: {
		// 				key: true,
		// 				ns: true,
		// 				tsKey: { select: { text: true } },
		// 			},
		// 		},
		// 		data: true,
		// 	},
		// },
	},
} satisfies {
	select: Prisma.OrganizationAttributeSelect | Prisma.ServiceAttributeSelect
	where: Prisma.OrganizationAttributeWhereInput | Prisma.ServiceAttributeWhereInput
}
const selectServ = {
	select: {
		services: {
			where: {
				tag: {
					active: true,
					category: {
						active: true,
					},
				},
			},
			select: {
				tag: {
					select: {
						id: true,
						tsKey: true,
						tsNs: true,
						category: {
							select: {
								id: true,
								tsKey: true,
								tsNs: true,
							},
						},
					},
				},
				service: {
					select: {
						attributes: selectAttrib,
					},
				},
			},
		},
	},
} satisfies { select: Prisma.OrgServiceSelect }

export const orgSearchSelect = {
	id: true,
	name: true,
	slug: true,
	attributes: selectAttrib,
	description: freeText,
	services: selectServ,
	locations: {
		select: {
			city: true,
			latitude: true,
			longitude: true,
			services: {
				select: {
					service: selectServ,
				},
			},
			attributes: selectAttrib,
		},
	},
} satisfies Prisma.OrganizationSelect

type Include<T> = { include: T }
type Select<T> = { select: T }
