import { isIdFor, prisma, type Prisma } from '@weareinreach/db'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoSchema } from './query.forContactInfo.schema'

const isPublic = globalWhere.isPublic()

const whereId = (input: TForContactInfoSchema): Prisma.OrgWebsiteWhereInput => {
	switch (true) {
		case isIdFor('organization', input.parentId): {
			return { organization: { id: input.parentId, ...isPublic } }
		}
		case isIdFor('orgLocation', input.parentId): {
			return { locations: { some: { location: { id: input.parentId, ...isPublic } } } }
		}

		default: {
			return {}
		}
	}
}

export const forContactInfo = async ({ input }: TRPCHandlerParams<TForContactInfoSchema>) => {
	const where = {
		...isPublic,
		...whereId(input),
		...(input.locationOnly !== undefined ? { orgLocationOnly: input.locationOnly } : {}),
	}

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
