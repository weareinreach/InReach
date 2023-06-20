import { z } from 'zod'

import { getIdPrefixRegex, isIdFor, type Prisma } from '@weareinreach/db'
import { defineRouter, publicProcedure } from '~api/lib/trpc'
import { isPublic } from '~api/schemas/selects/common'

export const miscRouter = defineRouter({
	hasContactInfo: publicProcedure
		.input(z.string().regex(getIdPrefixRegex('organization', 'orgLocation', 'orgService')))
		.query(async ({ ctx, input }) => {
			const whereId = (): {
				phone: Prisma.OrgPhoneWhereInput
				email: Prisma.OrgEmailWhereInput
				website: Prisma.OrgWebsiteWhereInput
				socialMedia: Prisma.OrgSocialMediaWhereInput
			} => {
				switch (true) {
					case isIdFor('organization', input): {
						return {
							email: { organization: { some: { organization: { id: input, ...isPublic } } }, ...isPublic },
							phone: { organization: { organization: { id: input, ...isPublic } }, ...isPublic },
							socialMedia: { organization: { id: input, ...isPublic }, ...isPublic },
							website: { organization: { id: input, ...isPublic }, ...isPublic },
						}
					}
					case isIdFor('orgLocation', input): {
						return {
							email: { locations: { some: { location: { id: input, ...isPublic } } }, ...isPublic },
							phone: { locations: { some: { location: { id: input, ...isPublic } } }, ...isPublic },
							socialMedia: { orgLocation: { id: input, ...isPublic }, ...isPublic },
							website: { orgLocation: { id: input, ...isPublic }, ...isPublic },
						}
					}
					case isIdFor('orgService', input): {
						return {
							email: { services: { some: { service: { id: input, ...isPublic } } }, ...isPublic },
							phone: { services: { some: { service: { id: input, ...isPublic } } }, ...isPublic },
							socialMedia: {},
							website: {},
						}
					}
					default: {
						return {
							email: {},
							phone: {},
							socialMedia: {},
							website: {},
						}
					}
				}
			}
			const [email, phone, socialMedia, website] = await Promise.all([
				ctx.prisma.orgEmail.count({ where: whereId().email }),
				ctx.prisma.orgPhone.count({ where: whereId().phone }),
				whereId().socialMedia ? ctx.prisma.orgSocialMedia.count({ where: whereId().socialMedia }) : 0,
				whereId().website ? ctx.prisma.orgWebsite.count({ where: whereId().website }) : 0,
			])
			return email + phone + socialMedia + website !== 0 // ? 'true' : 'false'
		}),
})
