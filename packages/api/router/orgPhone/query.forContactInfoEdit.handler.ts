import { isIdFor, type Prisma, prisma } from '@weareinreach/db'
import { type TForContactInfoSchema } from '~api/router/orgEmail/query.forContactInfo.schema'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoEditSchema } from './query.forContactInfoEdit.schema'

const getWhereId = (input: TForContactInfoEditSchema): Prisma.OrgPhoneWhereInput => {
	switch (true) {
		case isIdFor('organization', input.parentId): {
			// The organization's edit page lists only the organization's own items - not ones marked location-only,
			// which are edited on their location's page. Every phone/website/social item is stored under its
			// organization even when added from a location, so the flag (not the org link) is what tells them apart.
			return { organization: { organization: { id: input.parentId } }, locationOnly: false }
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

const forContactInfoEdit = async ({ input }: TRPCHandlerParams<TForContactInfoSchema>) => {
	const whereId = getWhereId(input)
	const isLocationPage = isIdFor('orgLocation', input.parentId)

	const result = await prisma.orgPhone.findMany({
		where: {
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
			published: true,
			deleted: true,
		},
		orderBy: [{ published: 'desc' }, { deleted: 'asc' }],
	})
	const transformed = result.map(({ description, phoneType, country, ...record }) => ({
		...record,
		linkedFromOrg: isLocationPage && !record.locationOnly,
		country: country?.cca2,
		phoneType: phoneType ? { key: phoneType?.key?.key, defaultText: phoneType?.key?.text } : null,
		description: description ? { key: description?.tsKey?.key, defaultText: description?.tsKey?.text } : null,
	}))
	return transformed
}
export default forContactInfoEdit
