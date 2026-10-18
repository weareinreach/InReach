import { isIdFor, prisma, type Prisma } from '@weareinreach/db'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoSchema } from './query.forContactInfo.schema'

const isPublic = globalWhere.isPublic()

const whereId = (input: TForContactInfoSchema): Prisma.OrgWebsiteWhereInput => {
	switch (true) {
		case isIdFor('organization', input.parentId): {
			// A location-only item belongs to that location: it never shows on the organization's own page, even
			// though it also carries the org relation (needed e.g. for its Crowdin description) (#2101).
			return { organization: { id: input.parentId, ...isPublic }, orgLocationOnly: false }
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
	const where = { ...isPublic, ...whereId(input) }

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
