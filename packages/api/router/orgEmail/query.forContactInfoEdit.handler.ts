import { isIdFor, type Prisma, prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoEditSchema } from './query.forContactInfoEdit.schema'

const whereId = (input: TForContactInfoEditSchema): Prisma.OrgEmailWhereInput => {
	switch (true) {
		case isIdFor('organization', input.parentId): {
			// The organization's edit page lists only the organization's own items - not ones marked location-only,
			// which are edited on their location's page. Every phone/website/social item is stored under its
			// organization even when added from a location, so the flag (not the org link) is what tells them apart.
			return { organization: { some: { organization: { id: input.parentId } } }, locationOnly: false }
		}
		case isIdFor('orgLocation', input.parentId): {
			return { locations: { some: { location: { id: input.parentId } } } }
		}
		case isIdFor('orgService', input.parentId): {
			return { services: { some: { service: { id: input.parentId } } } }
		}
		default: {
			return {}
		}
	}
}

const forContactInfoEdit = async ({ input }: TRPCHandlerParams<TForContactInfoEditSchema>) => {
	try {
		const result = await prisma.orgEmail.findMany({
			where: {
				...whereId(input),
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
				published: true,
				deleted: true,
				_count: { select: { organization: true } },
			},
			orderBy: [{ published: 'desc' }, { deleted: 'asc' }],
		})
		const isLocationPage = isIdFor('orgLocation', input.parentId)
		const transformed = result.map(({ description, title, _count, ...record }) => ({
			...record,
			// An email added from a location is stored under the location only, so it's never "from the org".
			linkedFromOrg: isLocationPage && !record.locationOnly && _count.organization > 0,
			title: title ? { key: title?.key?.key } : null,
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
