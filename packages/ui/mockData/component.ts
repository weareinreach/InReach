import { getTRPCMock, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const component = {
	ServiceSelect: getTRPCMock({
		path: ['component', 'ServiceSelect'],
		response: async () => {
			const { default: data } = await import('./json/component.ServiceSelect.json')
			return data
		},
	}),
} satisfies MockHandlerObject<'component'>
