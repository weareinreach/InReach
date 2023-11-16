import { isIdFor, prisma, type Prisma } from '@weareinreach/db'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoSchema } from './query.forContactInfo.schema'

const isPublic = globalWhere.isPublic()

const whereId = (input: TForContactInfoSchema, isSingleLoc?: boolean): Prisma.OrgWebsiteWhereInput => {
	switch (true) {
		case isIdFor('organization', input.parentId): {
			return isSingleLoc
				? {
						OR: [
							{ organization: { id: input.parentId, ...isPublic } },
							{ orgLocation: { organization: { id: input.parentId, ...isPublic } } },
						],
				  }
				: { organization: { id: input.parentId, ...isPublic } }
		}
		case isIdFor('orgLocation', input.parentId): {
			return { orgLocation: { id: input.parentId, ...isPublic } }
		}

		default: {
			return {}
		}
	}
}

export const forContactInfo = async ({ input }: TRPCHandlerParams<TForContactInfoSchema>) => {
	const locCount = isIdFor('organization', input.parentId)
		? await prisma.orgLocation.count({
				where: { organization: { id: input.parentId, ...isPublic }, ...isPublic },
		  })
		: 0
	const isSingleLoc = locCount === 1

	const result = await prisma.orgWebsite.findMany({
		where: {
			...isPublic,
			...whereId(input, isSingleLoc),
			...(input.locationOnly !== undefined ? { orgLocationOnly: input.locationOnly } : {}),
		},
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
		description: description ? { key: description?.tsKey.key, defaultText: description?.tsKey.text } : null,
	}))
	return transformed
}
