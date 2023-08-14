import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCheckForExistingSchema } from './query.checkForExisting.schema'

export const checkForExisting = async ({ input }: TRPCHandlerParams<TCheckForExistingSchema>) => {
	const result = await prisma.organization.findFirst({
		where: {
			name: {
				contains: input,
				mode: 'insensitive',
			},
		},
		select: {
			name: true,
			slug: true,
			published: true,
		},
	})
	return result
}
