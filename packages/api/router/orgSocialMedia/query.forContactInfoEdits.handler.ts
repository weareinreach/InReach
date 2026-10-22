import { isIdFor, prisma, type Prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoEditsSchema } from './query.forContactInfoEdits.schema'

const whereId = (input: TForContactInfoEditsSchema): Prisma.OrgSocialMediaWhereInput => {
	switch (true) {
		case isIdFor('organization', input.parentId): {
			// The organization's edit page lists only the organization's own items - not ones marked location-only,
			// which are edited on their location's page. Every phone/website/social item is stored under its
			// organization even when added from a location, so the flag (not the org link) is what tells them apart.
			return { organization: { id: input.parentId }, orgLocationOnly: false }
		}
		case isIdFor('orgLocation', input.parentId): {
			return { locations: { some: { location: { id: input.parentId } } } }
		}
		default: {
			return {}
		}
	}
}
const forContactInfoEdits = async ({ input }: TRPCHandlerParams<TForContactInfoEditsSchema>) => {
	try {
		const result = await prisma.orgSocialMedia.findMany({
			where: whereId(input),
			select: {
				id: true,
				url: true,
				username: true,
				service: { select: { name: true, logoIcon: true } },
				orgLocationOnly: true,
				published: true,
				deleted: true,
			},
		})
		const isLocationPage = isIdFor('orgLocation', input.parentId)
		const transformed = result.map(({ service, ...record }) => ({
			...record,
			linkedFromOrg: isLocationPage && !record.orgLocationOnly,
			service: service?.name,
			serviceIcon: service?.logoIcon,
		}))
		return transformed
	} catch (error) {
		return handleError(error)
	}
}
export default forContactInfoEdits
