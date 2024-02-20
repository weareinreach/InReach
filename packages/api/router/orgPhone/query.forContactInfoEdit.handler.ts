import { isIdFor, type Prisma, prisma } from '@weareinreach/db'
import { type TForContactInfoSchema } from '~api/router/orgEmail/query.forContactInfo.schema'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoEditSchema } from './query.forContactInfoEdit.schema'

const getWhereId = (input: TForContactInfoEditSchema, isSingleLoc?: boolean): Prisma.OrgPhoneWhereInput => {
	switch (true) {
		case isIdFor('organization', input.parentId): {
			return isSingleLoc
				? {
						OR: [
							{ organization: { organization: { id: input.parentId } } },
							{ locations: { some: { location: { organization: { id: input.parentId } } } } },
						],
					}
				: { organization: { organization: { id: input.parentId } } }
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

export const forContactInfoEdit = async ({ input }: TRPCHandlerParams<TForContactInfoSchema>) => {
	const locCount = isIdFor('organization', input.parentId)
		? await prisma.orgLocation.count({
				where: { organization: { id: input.parentId } },
			})
		: 0
	const isSingleLoc = locCount === 1

	const whereId = getWhereId(input, isSingleLoc)

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
		country: country?.cca2,
		phoneType: phoneType ? { key: phoneType?.key?.key, defaultText: phoneType?.key?.text } : null,
		description: description ? { key: description?.tsKey?.key, defaultText: description?.tsKey?.text } : null,
	}))
	return transformed
}
export default forContactInfoEdit
