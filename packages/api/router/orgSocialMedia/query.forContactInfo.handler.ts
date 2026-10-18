import { isIdFor, type Prisma, prisma } from '@weareinreach/db'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoSchema } from './query.forContactInfo.schema'

const isPublic = globalWhere.isPublic()
const whereId = (input: TForContactInfoSchema): Prisma.OrgSocialMediaWhereInput => {
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
	const result = await prisma.orgSocialMedia.findMany({
		where: {
			...isPublic,
			...whereId(input),
		},
		select: {
			id: true,
			url: true,
			username: true,
			service: { select: { name: true, logoIcon: true } },
			orgLocationOnly: true,
		},
	})
	const transformed = result.map(({ service, ...record }) => ({
		...record,
		service: service?.name,
		serviceIcon: service?.logoIcon,
	}))
	return transformed
}
export default forContactInfo
