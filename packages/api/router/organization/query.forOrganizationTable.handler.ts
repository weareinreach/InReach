import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForOrganizationTableSchema } from './query.forOrganizationTable.schema'

export const forOrganizationTable = async ({ input }: TRPCHandlerParams<TForOrganizationTableSchema>) => {
	const results = await prisma.organization.findMany({
		where: input,
		select: {
			id: true,
			name: true,
			slug: true,
			lastVerified: true,
			updatedAt: true,
			createdAt: true,
			published: true,
			deleted: true,
		},
		orderBy: [{ deleted: 'desc' }, { name: 'asc' }],
	})
	return results
}
