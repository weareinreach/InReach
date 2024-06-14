import { type ApiOutput } from '@weareinreach/api'
import { getTRPCMock, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const service = {
	forServiceInfoCard: getTRPCMock({
		path: ['service', 'forServiceInfoCard'],
		response: async () => {
			const { default: data } = await import('./json/service.forServiceInfoCard.json')
			return data as ApiOutput['service']['forServiceInfoCard']
		},
	}),
	forServiceModal: getTRPCMock({
		path: ['service', 'forServiceModal'],
		response: async () => {
			const { default: data } = await import('./json/service.forServiceModal.json')
			return data
		},
	}),
	getParentName: getTRPCMock({
		path: ['service', 'getParentName'],
		response: { name: 'Parent Organization Name' },
	}),
	getNames: getTRPCMock({
		path: ['service', 'getNames'],
		response: async () => {
			const { default: data } = await import('./json/service.getNames.json')
			return data
		},
	}),
	forServiceDrawer: getTRPCMock({
		path: ['service', 'forServiceDrawer'],
		response: async () => {
			const { default: data } = await import('./json/service.forServiceDrawer.json')
			return data
		},
	}),
	forServiceEditDrawer: getTRPCMock({
		path: ['service', 'forServiceEditDrawer'],
		response: async () => {
			const { default: data } = await import('./json/service.forServiceEditDrawer.json')
			return data
		},
	}),
	getOptions: getTRPCMock({
		path: ['service', 'getOptions'],
		response: async () => {
			const { default: data } = await import('./json/service.getOptions.json')
			return data
		},
	}),
	getFilterOptions: getTRPCMock({
		path: ['service', 'getFilterOptions'],
		type: 'query',
		response: async () => {
			const { default: data } = await import('./json/service.getFilterOptions.json')
			return data
		},
	}),
} satisfies MockHandlerObject<'service'>
