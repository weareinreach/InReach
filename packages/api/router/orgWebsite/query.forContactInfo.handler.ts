import { isIdFor, prisma, type Prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoSchema } from './query.forContactInfo.schema'

export const forContactInfo = async ({ input }: TRPCHandlerParams<TForContactInfoSchema>) => {
	try {
		const whereId = (): Prisma.OrgWebsiteWhereInput => {
			switch (true) {
				case isIdFor('organization', input.parentId): {
					return { organization: { id: input.parentId, ...globalWhere.isPublic() } }
				}
				case isIdFor('orgLocation', input.parentId): {
					return { orgLocation: { id: input.parentId, ...globalWhere.isPublic() } }
				}
				// case isIdFor('orgService', input.parentId): {
				// 	return { services: { some: { service: { id: input.parentId, ...globalWhere.isPublic() } } } }
				// }
				default: {
					return {}
				}
			}
		}

		const result = await prisma.orgWebsite.findMany({
			where: {
				...globalWhere.isPublic(),
				...whereId(),
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
	} catch (error) {
		handleError(error)
	}
}
