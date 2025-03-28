import { z } from 'zod'

import { type Prisma } from '@weareinreach/db'
import { type Context } from '~api/lib'

import { attributes, countryWithoutGeo, freeText, isPublic, phoneSelectPublic } from './common'

type OrgIncludeKeys = z.ZodObject<
	{
		[k in keyof Omit<Prisma.OrganizationInclude, '_count'>]-?: z.ZodDefault<z.ZodBoolean>
	},
	'strip'
>
// type OrgSelectKeys = {
// 	[k in keyof Prisma.OrganizationSelect]: z.infer<typeof boolFalse>
// }

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
	suggestions: boolFalse,
	oldSlugs: boolFalse,
})

const base = { id: true, createdAt: true, updatedAt: true }

export const organizationSelect = {
	...base,
	name: true,
	slug: true,
	published: true,
	lastVerified: true,
} satisfies Prisma.OrganizationSelect
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
				locationOnly: true,
				serviceOnly: true,
			},
		},
	},
} satisfies Prisma.OrgService$emailsArgs | Prisma.Organization$emailsArgs | Prisma.OrgLocation$emailsArgs

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
} satisfies Prisma.LanguageDefaultArgs

const orgWebsiteInclude = {
	where: isPublic,
	select: {
		id: true,
		description: freeText,
		languages: { select: { language: languageSelect } },
		url: true,
		isPrimary: true,
		locations: { select: { orgLocationId: true } },
		orgLocationOnly: true,
	},
} satisfies Prisma.Organization$websitesArgs

type AttributeInclude =
	| Prisma.Organization$attributesArgs
	| Prisma.OrgLocation$attributesArgs
	| Prisma.OrgService$attributesArgs

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
} satisfies Prisma.GovDistDefaultArgs

const serviceAreaInclude = {
	select: {
		countries: { select: { country: countryWithoutGeo } },
		districts: { select: { govDist: govDistInclude } },
	},
} satisfies Prisma.ServiceAreaDefaultArgs
const attributeDefInclude = {
	select: {
		categories: { select: { category: { select: { icon: true, ns: true, tag: true } } } },
	},
} satisfies Prisma.AttributeDefaultArgs
const serviceTagInclude = {
	select: {
		name: true,
		tsKey: true,
		tsNs: true,
		primaryCategory: {
			select: {
				tsKey: true,
				tsNs: true,
			},
		},
		defaultAttributes: { select: { attribute: attributeDefInclude } },
	},
} satisfies Prisma.ServiceTagDefaultArgs
const orgServiceTagInclude = {
	select: { tag: serviceTagInclude },
} satisfies Prisma.OrgServiceTagDefaultArgs

const reviewIds = {
	where: {
		visible: true,
		deleted: false,
	},
	select: { id: true },
} satisfies Prisma.Organization$reviewsArgs | Prisma.OrgLocation$reviewsArgs | Prisma.OrgService$reviewsArgs

const orgServiceInclude = (ctx: Omit<Context, 'prisma'>) =>
	({
		where: isPublic,
		select: {
			serviceName: freeText,
			description: freeText,
			hours: hoursSelect,
			attributes: attributeInclude,
			serviceAreas: serviceAreaInclude,
			services: orgServiceTagInclude,
			reviews: reviewIds,
			phones: phoneSelectPublic,
			emails: orgEmailInclude,
			userLists: userListSelect(ctx),
			id: true,
		},
	}) satisfies Prisma.Organization$servicesArgs

const orgLocationServiceInclude = (ctx: Omit<Context, 'prisma'>) =>
	({
		where: {
			service: isPublic,
		},
		select: { service: { select: orgServiceInclude(ctx).select } },
	}) satisfies Prisma.OrgLocation$servicesArgs

const photoSelect = {
	where: isPublic,
	select: {
		src: true,
		height: true,
		width: true,
	},
} satisfies Prisma.OrgLocation$photosArgs

const userListSelect = (ctx: Omit<Context, 'prisma'>) => {
	if (!ctx.session?.user?.id) return undefined
	return {
		where: {
			list: {
				ownedById: ctx.session?.user?.id,
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

export const orgLocationInclude = (ctx: Omit<Context, 'prisma'>) =>
	({
		where: isPublic,
		select: {
			govDist: govDistInclude,
			country: countryWithoutGeo,
			attributes: attributeInclude,
			emails: orgEmailInclude,
			// websites: orgWebsiteInclude,
			websites: { select: { website: orgWebsiteInclude } },
			phones: phoneSelectPublic,
			photos: photoSelect,
			hours: hoursSelect,
			reviews: reviewIds,
			services: orgLocationServiceInclude(ctx),
			serviceAreas: serviceAreaInclude,
			socialMedia: { select: { socialMedia: orgSocialMediaInclude } },
			description: freeText,
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
	}) satisfies Prisma.Organization$locationsArgs

export const organizationInclude = (ctx: Omit<Context, 'prisma'>) =>
	({
		select: {
			description: freeText,
			emails: orgEmailInclude,
			locations: orgLocationInclude(ctx),
			phones: phoneSelectPublic,
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
				select: {
					// _count: true,
					userId: true,
				},
			},
			name: true,
			slug: true,
			id: true,
			lastVerified: true,
		},
	}) satisfies Pick<Prisma.OrganizationFindUniqueOrThrowArgs, 'select'>

export const selectServCat = {
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
						OR: [{ tag: 'organization-leadership' }, { tag: 'service-focus' }],
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
				_count: { select: { parents: true } },
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
	select: Prisma.AttributeSupplementSelect
	where: Prisma.AttributeSupplementWhereInput
}
const selectServ = {
	select: {
		services: {
			where: {
				tag: {
					active: true,
					primaryCategory: {
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
						primaryCategory: {
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

// type Include<T> = { include: T }
// type Select<T> = { select: T }
