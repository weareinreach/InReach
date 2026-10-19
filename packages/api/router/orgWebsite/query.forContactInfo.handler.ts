import { isIdFor, prisma, type Prisma } from '@weareinreach/db'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoSchema } from './query.forContactInfo.schema'

const isPublic = globalWhere.isPublic()

// Only relevant when listing for the organization's own page (see whereId).
const isSingleLocationOrg = async (input: TForContactInfoSchema) =>
	isIdFor('organization', input.parentId) &&
	(await prisma.orgLocation.count({ where: { organization: { id: input.parentId }, ...isPublic } })) === 1

const whereId = (input: TForContactInfoSchema, isSingleLoc: boolean): Prisma.OrgWebsiteWhereInput => {
	switch (true) {
		case isIdFor('organization', input.parentId): {
			// A location-only item belongs to that location: on a multi-location org it never shows on the
			// organization's own page, even though it also carries the org relation (needed e.g. for its Crowdin
			// description) (#2101). A single-location org has no separate location page a visitor reaches - its
			// page shows that location inline - so there it shows everything, same as orgPhone's rule.
			const onOrg = { organization: { id: input.parentId, ...isPublic } }
			return isSingleLoc ? onOrg : { ...onOrg, orgLocationOnly: false }
		}
		case isIdFor('orgLocation', input.parentId): {
			// A location page shows everything linked to it - its own location-only items and org-wide ones
			// linked to it - unless the caller asks for only the location-only ones.
			return {
				locations: { some: { location: { id: input.parentId, ...isPublic } } },
				...(input.locationOnly ? { orgLocationOnly: true } : {}),
			}
		}

		default: {
			return {}
		}
	}
}

const forContactInfo = async ({ input }: TRPCHandlerParams<TForContactInfoSchema>) => {
	const where = { ...isPublic, ...whereId(input, await isSingleLocationOrg(input)) }

	const result = await prisma.orgWebsite.findMany({
		where,
		select: {
			id: true,
			url: true,
			isPrimary: true,
			description: { select: { tsKey: { select: { text: true, key: true } } } },
			orgLocationOnly: true,
		},
		orderBy: { isPrimary: 'desc' },
	})
	const transformed = result.map(({ description, ...record }) => ({
		...record,
		description: description ? { key: description?.tsKey?.key, defaultText: description?.tsKey?.text } : null,
	}))
	return transformed
}
export default forContactInfo
