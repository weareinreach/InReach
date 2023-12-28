import { type ApiOutput } from '@weareinreach/api'
import { getTRPCMock, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const attribute = {
	getFilterOptions: getTRPCMock({
		path: ['attribute', 'getFilterOptions'],
		type: 'query',
		response: async () => {
			const { default: data } = await import('./json/attribute.getFilterOptions.json')
			return data as ApiOutput['attribute']['getFilterOptions']
		},
	}),
} satisfies MockHandlerObject<'attribute'>
