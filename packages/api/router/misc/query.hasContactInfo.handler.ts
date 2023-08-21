import { isIdFor, type Prisma, prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type THasContactInfoSchema } from './query.hasContactInfo.schema'

export const hasContactInfo = async ({ input }: TRPCHandlerParams<THasContactInfoSchema>) => {
	try {
		const whereId = (): {
			phone: Prisma.OrgPhoneWhereInput
			email: Prisma.OrgEmailWhereInput
			website: Prisma.OrgWebsiteWhereInput
			socialMedia: Prisma.OrgSocialMediaWhereInput
		} => {
			switch (true) {
				case isIdFor('organization', input): {
					return {
						email: {
							organization: { some: { organization: { id: input, ...globalWhere.isPublic } } },
							...globalWhere.isPublic,
						},
						phone: {
							organization: { organization: { id: input, ...globalWhere.isPublic } },
							...globalWhere.isPublic,
						},
						socialMedia: { organization: { id: input, ...globalWhere.isPublic }, ...globalWhere.isPublic },
						website: { organization: { id: input, ...globalWhere.isPublic }, ...globalWhere.isPublic },
					}
				}
				case isIdFor('orgLocation', input): {
					return {
						email: {
							locations: { some: { location: { id: input, ...globalWhere.isPublic } } },
							...globalWhere.isPublic,
						},
						phone: {
							locations: { some: { location: { id: input, ...globalWhere.isPublic } } },
							...globalWhere.isPublic,
						},
						socialMedia: { orgLocation: { id: input, ...globalWhere.isPublic }, ...globalWhere.isPublic },
						website: { orgLocation: { id: input, ...globalWhere.isPublic }, ...globalWhere.isPublic },
					}
				}
				case isIdFor('orgService', input): {
					return {
						email: {
							services: { some: { service: { id: input, ...globalWhere.isPublic } } },
							...globalWhere.isPublic,
						},
						phone: {
							services: { some: { service: { id: input, ...globalWhere.isPublic } } },
							...globalWhere.isPublic,
						},
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
			prisma.orgEmail.count({ where: whereId().email }),
			prisma.orgPhone.count({ where: whereId().phone }),
			whereId().socialMedia ? prisma.orgSocialMedia.count({ where: whereId().socialMedia }) : 0,
			whereId().website ? prisma.orgWebsite.count({ where: whereId().website }) : 0,
		])
		return email + phone + socialMedia + website !== 0 // ? 'true' : 'false'
	} catch (error) {
		handleError(error)
	}
}
