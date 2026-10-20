import { isIdFor, prisma, type Prisma } from '@weareinreach/db'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoSchema } from './query.forContactInfo.schema'

const isPublic = globalWhere.isPublic()

// Only relevant when listing for the organization's own page (see whereId).
const isSingleLocationOrg = async (input: TForContactInfoSchema) =>
	isIdFor('organization', input.parentId) &&
	(await prisma.orgLocation.count({ where: { organization: { id: input.parentId }, ...isPublic } })) === 1

const whereId = (input: TForContactInfoSchema, isSingleLoc: boolean): Prisma.OrgEmailWhereInput => {
	switch (true) {
		case isIdFor('organization', input.parentId): {
			// Same rule as orgWebsite/orgSocialMedia (#2101): a location-only email belongs to its location, so a
			// multi-location org's own page leaves it out. A single-location org's page shows its one location
			// inline (no separate location page is ever reached), so it shows everything - including emails
			// added from that location, which are linked to the location only, never to the org.
			const onOrg = { organization: { some: { organization: { id: input.parentId, ...isPublic } } } }
			if (isSingleLoc) {
				return {
					OR: [onOrg, { locations: { some: { location: { orgId: input.parentId, ...isPublic } } } }],
				}
			}
			return { ...onOrg, locationOnly: false }
		}
		case isIdFor('orgLocation', input.parentId): {
			// A location page shows everything linked to it - its own location-only emails and org-wide ones
			// linked to it - unless the caller asks for only the location-only ones. This used to apply
			// `locationOnly` as a plain filter on every page, and the UI always sends `false`, so a location's
			// own location-only emails showed nowhere at all.
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
	const result = await prisma.orgEmail.findMany({
		where: {
			...isPublic,
			...whereId(input, await isSingleLocationOrg(input)),
			...(input.serviceOnly !== undefined ? { serviceOnly: input.serviceOnly } : {}),
		},
		select: {
			id: true,
			email: true,
			firstName: true,
			lastName: true,
			primary: true,
			title: { select: { key: { select: { key: true } } } },
			description: { select: { tsKey: { select: { text: true, key: true } } } },
			locationOnly: true,
			serviceOnly: true,
		},
		orderBy: { primary: 'desc' },
	})
	const transformed = result.map(({ description, title, ...record }) => ({
		...record,
		title: title ? { key: title?.key?.key } : null,
		description: description ? { key: description?.tsKey?.key, defaultText: description?.tsKey?.text } : null,
	}))
	return transformed
}
export default forContactInfo
