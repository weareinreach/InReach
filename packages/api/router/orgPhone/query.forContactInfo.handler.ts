import { isIdFor, type Prisma, prisma } from '@weareinreach/db'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoSchema } from './query.forContactInfo.schema'

const isPublic = globalWhere.isPublic()
const getWhereId = (input: TForContactInfoSchema, isSingleLoc: boolean): Prisma.OrgPhoneWhereInput => {
	switch (true) {
		case isIdFor('organization', input.parentId): {
			// Same rule as orgEmail/orgWebsite/orgSocialMedia: a multi-location org's main page shows its phones
			// except location-only ones. Every phone is stored under its organization (even one added from a
			// location), so the location-only flag - not the location links - is what says it belongs to a
			// location: an org number that's also linked to locations still shows here, and a number listed at
			// every location but marked location-only doesn't. A single-location org has no separate public
			// location page a visitor would ever reach, so it keeps showing everything.
			const ownedByOrg = { organization: { organization: { id: input.parentId, ...isPublic } } }
			return isSingleLoc ? ownedByOrg : { ...ownedByOrg, locationOnly: false }
		}
		case isIdFor('orgLocation', input.parentId): {
			// A location page shows everything linked to it - its own location-only phones and org phones
			// linked to it - unless the caller asks for only the location-only ones.
			return {
				locations: { some: { location: { id: input.parentId, ...isPublic } } },
				...(input.locationOnly ? { locationOnly: true } : {}),
			}
		}
		case isIdFor('orgService', input.parentId): {
			return { services: { some: { service: { id: input.parentId, ...isPublic } } } }
		}
		default: {
			return {}
		}
	}
}

const forContactInfo = async ({ input }: TRPCHandlerParams<TForContactInfoSchema>) => {
	// Only relevant when listing for the organization's own page - a location's or service's page
	// always shows everything linked to it regardless of how many locations the org has.
	const locCount = isIdFor('organization', input.parentId)
		? await prisma.orgLocation.count({ where: { organization: { id: input.parentId }, ...isPublic } })
		: 0
	const isSingleLoc = locCount === 1

	const whereId = getWhereId(input, isSingleLoc)

	const result = await prisma.orgPhone.findMany({
		where: {
			...isPublic,
			...whereId,
		},
		select: {
			id: true,
			number: true,
			ext: true,
			country: { select: { cca2: true } },
			primary: true,
			description: { select: { tsKey: { select: { text: true, key: true } } } },
			phoneType: { select: { key: { select: { text: true, key: true } } } },
			locationOnly: true,
		},
		orderBy: { primary: 'desc' },
	})
	const transformed = result.map(({ description, phoneType, country, ...record }) => ({
		...record,
		country: country?.cca2,
		phoneType: phoneType ? { key: phoneType?.key?.key, defaultText: phoneType?.key?.text } : null,
		description: description ? { key: description?.tsKey?.key, defaultText: description?.tsKey?.text } : null,
	}))
	return transformed
}
export default forContactInfo
