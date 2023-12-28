import { type ApiOutput } from '@weareinreach/api'
import { getTRPCMock, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const review = {
	getByIds: getTRPCMock({
		path: ['review', 'getByIds'],
		type: 'query',
		response: async () => {
			const { default: data } = await import('./json/review.getByIds.json')
			const formatted = data.map(({ createdAt, ...review }) => ({
				...review,
				createdAt: new Date(createdAt),
			}))
			return formatted as ApiOutput['review']['getByIds']
		},
	}),
	getAverage: getTRPCMock({
		path: ['review', 'getAverage'],
		type: 'query',
		response: {
			average: 4.3,
			count: 10,
		},
	}),
	create: getTRPCMock({
		path: ['review', 'create'],
		type: 'mutation',
		response: {
			id: 'orev_NEWREVIEWID',
		},
	}),
} satisfies MockHandlerObject<'review'>
