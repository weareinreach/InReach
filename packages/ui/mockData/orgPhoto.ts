import { type HttpHandler } from 'msw'

import { getTRPCMock, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const orgPhoto = {
	getByParent: getTRPCMock({
		path: ['orgPhoto', 'getByParent'],
		response: async () => {
			const { default: data } = await import('./json/orgPhoto.getByParent.json')
			return data
		},
	}),
	getByParent2: getTRPCMock({
		path: ['orgPhoto', 'getByParent'],
		response: async () => {
			const { default: data } = await import('./json/orgPhoto.getByParent.json')
			return data.slice(0, 2)
		},
	}),
	getByParent4: getTRPCMock({
		path: ['orgPhoto', 'getByParent'],
		response: async () => {
			const { default: data } = await import('./json/orgPhoto.getByParent.json')
			return data.slice(0, 4)
		},
	}),
	getByParent0: getTRPCMock({
		path: ['orgPhoto', 'getByParent'],
		response: [],
	}),
} satisfies MockHandlerObject<'orgPhoto'> & {
	getByParent2: HttpHandler
	getByParent4: HttpHandler
	getByParent0: HttpHandler
}
