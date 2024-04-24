import { isIdFor, prisma, type Prisma } from '@weareinreach/db'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoSchema } from './query.forContactInfo.schema'

const isPublic = globalWhere.isPublic()
const whereId = (input: TForContactInfoSchema): Prisma.OrgEmailWhereInput => {
	switch (true) {
		case isIdFor('organization', input.parentId): {
			return { organization: { some: { organization: { id: input.parentId, ...isPublic } } } }
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

const forContactInfo = async ({ input }: TRPCHandlerParams<TForContactInfoSchema>) => {
	const result = await prisma.orgEmail.findMany({
		where: {
			...isPublic,
			...whereId(input),
			...(input.locationOnly !== undefined ? { locationOnly: input.locationOnly } : {}),
			...(input.serviceOnly !== undefined ? { serviceOnly: input.serviceOnly } : {}),
		},
		select: {
			id: true,
			email: true,
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
