import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForReportsTableSchema } from './query.forReportsTable.schema'

const forReportsTable = async ({ input }: TRPCHandlerParams<TForReportsTableSchema>) => {
	const results = await prisma.report.findMany({
		where: input,
		select: {
			id: true,
			organizationId: true,
			orgNameSnapshot: true,
			serviceId: true,
			serviceNameSnapshot: true,
			issueType: true,
			status: true,
			informed: true,
			userEmail: true,
			userName: true,
			createdAt: true,
			updatedAt: true,
			reportedBy: {
				select: {
					id: true,
					name: true,
				},
			},
			handledBy: {
				select: {
					id: true,
					name: true,
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	})
	return results
}

export default forReportsTable
