import { isIdFor, type Prisma, prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetByParentSchema } from './query.getByParent.schema'

export const getByParent = async ({ input }: TRPCHandlerParams<TGetByParentSchema>) => {
	try {
		const whereId = (): Prisma.OrgPhotoWhereInput => {
			switch (true) {
				case isIdFor('organization', input): {
					return { organization: { id: input, ...globalWhere.isPublic() } }
				}
				case isIdFor('orgLocation', input): {
					return { orgLocation: { id: input, ...globalWhere.isPublic() } }
				}
				default: {
					return {}
				}
			}
		}
		const result = await prisma.orgPhoto.findMany({
			where: {
				...globalWhere.isPublic(),
				...whereId(),
			},
			select: {
				id: true,
				src: true,
				height: true,
				width: true,
			},
		})
		return result
	} catch (error) {
		handleError(error)
	}
}
