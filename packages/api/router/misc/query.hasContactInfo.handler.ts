import { isIdFor, type Prisma, prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type THasContactInfoSchema } from './query.hasContactInfo.schema'

const whereId = (
	input: THasContactInfoSchema,
	isSingleLoc?: boolean
): {
	phone: Prisma.OrgPhoneWhereInput
	email: Prisma.OrgEmailWhereInput
	website: Prisma.OrgWebsiteWhereInput
	socialMedia: Prisma.OrgSocialMediaWhereInput
} => {
	const isPublic = globalWhere.isPublic()
	switch (true) {
		case isIdFor('organization', input): {
			const emailOrg = { organization: { some: { organization: { id: input, ...isPublic } } } }
			const phoneOrg = { organization: { organization: { id: input, ...isPublic } } }
			const smWebOrg = { organization: { id: input, ...isPublic } }

			const phoneEmailLoc = {
				locations: { some: { location: { organization: { id: input, ...isPublic } } } },
			}
			const smWebLoc = { locations: { some: { location: { organization: { id: input, ...isPublic } } } } }

			return isSingleLoc
				? {
						email: {
							OR: [emailOrg, phoneEmailLoc],
							...isPublic,
						},
						phone: {
							OR: [phoneOrg, phoneEmailLoc],
							...isPublic,
						},
						socialMedia: {
							OR: [smWebOrg, smWebLoc],
							...isPublic,
						},
						website: {
							OR: [smWebOrg, smWebLoc],
							...isPublic,
						},
					}
				: {
						email: {
							...emailOrg,
							...isPublic,
						},
						phone: {
							...phoneOrg,
							...isPublic,
						},
						socialMedia: {
							...smWebOrg,
							...isPublic,
						},
						website: {
							...smWebOrg,
							...isPublic,
						},
					}
		}
		case isIdFor('orgLocation', input): {
			return {
				email: {
					locations: { some: { location: { id: input, ...isPublic } } },
					...isPublic,
				},
				phone: {
					locations: { some: { location: { id: input, ...isPublic } } },
					...isPublic,
				},
				socialMedia: { locations: { some: { location: { id: input, ...isPublic } } }, ...isPublic },
				website: { locations: { some: { location: { id: input, ...isPublic } } }, ...isPublic },
			}
		}
		case isIdFor('orgService', input): {
			return {
				email: {
					services: { some: { service: { id: input, ...globalWhere.isPublic() } } },
					...globalWhere.isPublic(),
				},
				phone: {
					services: { some: { service: { id: input, ...globalWhere.isPublic() } } },
					...globalWhere.isPublic(),
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

const hasContactInfo = async ({ input }: TRPCHandlerParams<THasContactInfoSchema>) => {
	try {
		const locCount = isIdFor('organization', input)
			? await prisma.orgLocation.count({ where: { organization: { id: input } } })
			: 0
		const isSingleLoc = locCount === 1

		const [email, phone, socialMedia, website] = await Promise.all([
			prisma.orgEmail.count({ where: whereId(input, isSingleLoc).email }),
			prisma.orgPhone.count({ where: whereId(input, isSingleLoc).phone }),
			whereId(input, isSingleLoc).socialMedia
				? prisma.orgSocialMedia.count({ where: whereId(input, isSingleLoc).socialMedia })
				: 0,
			whereId(input, isSingleLoc).website
				? prisma.orgWebsite.count({ where: whereId(input, isSingleLoc).website })
				: 0,
		])

		const totalCount = email + phone + socialMedia + website

		return totalCount !== 0
	} catch (error) {
		return handleError(error)
	}
}
export default hasContactInfo
