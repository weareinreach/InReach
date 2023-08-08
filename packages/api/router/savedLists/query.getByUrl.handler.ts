import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetByUrlSchema } from './query.getByUrl.schema'

export const getByUrl = async ({ input }: TRPCHandlerParams<TGetByUrlSchema>) => {
	try {
		const list = await prisma.userSavedList.findUniqueOrThrow({
			where: {
				sharedLinkKey: input.slug,
			},
			include: {
				organizations: true,
				services: true,
			},
		})

		return list
	} catch (error) {
		handleError(error)
	}
}
