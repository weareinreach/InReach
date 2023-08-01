import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetNameFromSlugSchema } from './query.getNameFromSlug.schema'

export const getNameFromSlug = async ({ input }: TRPCHandlerParams<TGetNameFromSlugSchema>) => {
	try {
		const result = prisma.organization.findUniqueOrThrow({
			where: {
				slug: input,
			},
			select: {
				name: true,
			},
		})
		return result
	} catch (error) {
		handleError(error)
	}
}
