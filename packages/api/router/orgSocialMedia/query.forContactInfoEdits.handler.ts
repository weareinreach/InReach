import { isIdFor, prisma, type Prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoEditsSchema } from './query.forContactInfoEdits.schema'

const whereId = (input: TForContactInfoEditsSchema): Prisma.OrgSocialMediaWhereInput => {
	switch (true) {
		case isIdFor('organization', input.parentId): {
			return { organization: { id: input.parentId } }
		}
		case isIdFor('orgLocation', input.parentId): {
			return { locations: { some: { location: { id: input.parentId } } } }
		}
		default: {
			return {}
		}
	}
}
export const forContactInfoEdits = async ({ input }: TRPCHandlerParams<TForContactInfoEditsSchema>) => {
	try {
		const result = await prisma.orgSocialMedia.findMany({
			where: whereId(input),
			select: {
				id: true,
				url: true,
				username: true,
				service: { select: { name: true, logoIcon: true } },
				orgLocationOnly: true,
				published: true,
				deleted: true,
			},
		})
		const transformed = result.map(({ service, ...record }) => ({
			...record,
			service: service?.name,
			serviceIcon: service?.logoIcon,
		}))
		return transformed
	} catch (error) {
		handleError(error)
	}
}
export default forContactInfoEdits
