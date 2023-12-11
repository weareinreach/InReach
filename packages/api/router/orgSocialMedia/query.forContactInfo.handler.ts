import { isIdFor, type Prisma, prisma } from '@weareinreach/db'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoSchema } from './query.forContactInfo.schema'

const isPublic = globalWhere.isPublic()
const whereId = (input: TForContactInfoSchema, isSingleLoc?: boolean): Prisma.OrgSocialMediaWhereInput => {
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

	const result = await prisma.orgSocialMedia.findMany({
		where: {
			...isPublic,
			...whereId(input, isSingleLoc),
			...(input.locationOnly !== undefined ? { locationOnly: input.locationOnly } : {}),
		},
		select: {
			id: true,
			url: true,
			username: true,
			service: { select: { name: true } },
			orgLocationOnly: true,
		},
	})
	const transformed = result.map(({ service, ...record }) => ({
		...record,
		service: service?.name,
	}))
	return transformed
}
