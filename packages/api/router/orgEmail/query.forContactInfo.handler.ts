import { isIdFor, prisma, type Prisma } from '@weareinreach/db'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoSchema } from './query.forContactInfo.schema'

const isPublic = globalWhere.isPublic()
const whereId = (input: TForContactInfoSchema, isSingleLoc?: boolean): Prisma.OrgEmailWhereInput => {
	switch (true) {
		case isIdFor('organization', input.parentId): {
			return isSingleLoc
				? {
						OR: [
							{ organization: { some: { organization: { id: input.parentId, ...isPublic } } } },
							{ locations: { some: { location: { organization: { id: input.parentId, ...isPublic } } } } },
						],
					}
				: { organization: { some: { organization: { id: input.parentId, ...isPublic } } } }
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
	const locCount = isIdFor('organization', input.parentId)
		? await prisma.orgLocation.count({
				where: { organization: { id: input.parentId, ...isPublic }, ...isPublic },
			})
		: 0
	const isSingleLoc = locCount === 1

	const result = await prisma.orgEmail.findMany({
		where: {
			...isPublic,
			...whereId(input, isSingleLoc),
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
		title: title ? { key: title?.key.key } : null,
		description: description ? { key: description?.tsKey.key, defaultText: description?.tsKey.text } : null,
	}))
	return transformed
}
