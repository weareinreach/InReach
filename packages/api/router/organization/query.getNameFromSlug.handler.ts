import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetNameFromSlugSchema } from './query.getNameFromSlug.schema'

export const getNameFromSlug = async ({ input }: TRPCHandlerParams<TGetNameFromSlugSchema>) => {
	const result = prisma.organization.findUniqueOrThrow({
		where: {
			slug: input,
		},
		select: {
			name: true,
		},
	})
	return result
}
