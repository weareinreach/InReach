import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForReviewTableSchema } from './query.forReviewTable.schema'

const forReviewTable = async (_params: TRPCHandlerParams<TForReviewTableSchema>) => {
	const results = await prisma.orgReview.findMany({
		select: {
			id: true,
			rating: true,
			reviewText: true,
			visible: true,
			deleted: true,
			createdAt: true,
			updatedAt: true,
			organization: {
				select: {
					id: true,
					name: true,
					slug: true,
				},
			},
			orgService: {
				select: {
					id: true,
					serviceName: {
						select: {
							key: true,
							ns: true,
							tsKey: {
								select: {
									text: true,
								},
							},
						},
					},
				},
			},
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
		orderBy: [{ deleted: 'asc' }, { createdAt: 'desc' }],
	})

	return results
}

export default forReviewTable
