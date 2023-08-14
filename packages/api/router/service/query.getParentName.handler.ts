import { TRPCError } from '@trpc/server'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetParentNameSchema } from './query.getParentName.schema'

export const getParentName = async ({ input }: TRPCHandlerParams<TGetParentNameSchema>) => {
	const { slug, orgLocationId } = input

	switch (true) {
		case Boolean(slug): {
			return prisma.organization.findUniqueOrThrow({
				where: { slug },
				select: { name: true },
			})
		}
		case Boolean(orgLocationId): {
			return prisma.orgLocation.findUniqueOrThrow({
				where: { id: orgLocationId },
				select: { name: true },
			})
		}
		default: {
			throw new TRPCError({ code: 'BAD_REQUEST' })
		}
	}
}
