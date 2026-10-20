import { isIdFor, prisma, type Prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoEditSchema } from './query.forContactInfoEdit.schema'

const whereId = (input: TForContactInfoEditSchema): Prisma.OrgWebsiteWhereInput => {
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
const forContactInfoEdit = async ({ input }: TRPCHandlerParams<TForContactInfoEditSchema>) => {
	try {
		const result = await prisma.orgWebsite.findMany({
			where: {
				...whereId(input),
			},
			select: {
				id: true,
				url: true,
				description: { select: { tsKey: { select: { text: true, key: true } } } },
				published: true,
				deleted: true,
				orgLocationOnly: true,
			},
			orderBy: [{ published: 'desc' }, { deleted: 'asc' }],
		})
		const isLocationPage = isIdFor('orgLocation', input.parentId)
		const transformed = result.map(({ description, ...record }) => ({
			...record,
			linkedFromOrg: isLocationPage && !record.orgLocationOnly,
			description: description
				? { key: description?.tsKey?.key, defaultText: description?.tsKey?.text }
				: null,
		}))
		return transformed
	} catch (error) {
		return handleError(error)
	}
}
export default forContactInfoEdit
