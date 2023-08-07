import { isIdFor, type Prisma, prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoSchema } from './query.forContactInfo.schema'

export const forContactInfo = async ({ input }: TRPCHandlerParams<TForContactInfoSchema>) => {
	try {
		const whereId = (): Prisma.OrgSocialMediaWhereInput => {
			switch (true) {
				case isIdFor('organization', input.parentId): {
					return { organization: { id: input.parentId, ...globalWhere.isPublic() } }
				}
				case isIdFor('orgLocation', input.parentId): {
					return { orgLocation: { id: input.parentId, ...globalWhere.isPublic() } }
				}
				default: {
					return {}
				}
			}
		}

		const result = await prisma.orgSocialMedia.findMany({
			where: {
				...globalWhere.isPublic(),
				...whereId(),
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
	} catch (error) {
		handleError(error)
	}
}
