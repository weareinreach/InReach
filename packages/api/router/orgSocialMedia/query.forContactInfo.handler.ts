import { isIdFor, type Prisma, prisma } from '@weareinreach/db'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoSchema } from './query.forContactInfo.schema'

const isPublic = globalWhere.isPublic()
const whereId = (input: TForContactInfoSchema): Prisma.OrgSocialMediaWhereInput => {
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

const forContactInfo = async ({ input }: TRPCHandlerParams<TForContactInfoSchema>) => {
	const result = await prisma.orgSocialMedia.findMany({
		where: {
			...isPublic,
			...whereId(input),
			...(input.locationOnly !== undefined ? { locationOnly: input.locationOnly } : {}),
		},
		select: {
			id: true,
			url: true,
			username: true,
			service: { select: { name: true, logoIcon: true } },
			orgLocationOnly: true,
		},
	})
	const transformed = result.map(({ service, ...record }) => ({
		...record,
		service: service?.name,
		serviceIcon: service?.logoIcon,
	}))
	return transformed
}
export default forContactInfo
