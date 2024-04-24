import { isIdFor, type Prisma, prisma } from '@weareinreach/db'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoSchema } from './query.forContactInfo.schema'

const isPublic = globalWhere.isPublic()
const getWhereId = (input: TForContactInfoSchema): Prisma.OrgPhoneWhereInput => {
	switch (true) {
		case isIdFor('organization', input.parentId): {
			return { organization: { organization: { id: input.parentId, ...isPublic } } }
		}
		case isIdFor('orgLocation', input.parentId): {
			return { locations: { some: { location: { id: input.parentId, ...isPublic } } } }
		}
		case isIdFor('orgService', input.parentId): {
			return { services: { some: { service: { id: input.parentId, ...isPublic } } } }
		}
		default: {
			return {}
		}
	}
}

export const forContactInfo = async ({ input }: TRPCHandlerParams<TForContactInfoSchema>) => {
	const whereId = getWhereId(input)

	const result = await prisma.orgPhone.findMany({
		where: {
			...isPublic,
			...whereId,
			...(input.locationOnly !== undefined ? { locationOnly: input.locationOnly } : {}),
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
