import { getTRPCMock, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const serviceArea = {
	getServiceArea: getTRPCMock({
		path: ['serviceArea', 'getServiceArea'],
		response: async () => {
			const { default: data } = await import('./json/serviceArea.getServiceArea.json')
			return data
		},
	}),
	update: getTRPCMock({
		path: ['serviceArea', 'update'],
		type: 'mutation',
		response: (input) => ({
			countries: {
				created: input.countries.createdVals?.length ?? 0,
				deleted: input.countries.deletedVals?.length ?? 0,
			},
			districts: {
				created: input.districts.createdVals?.length ?? 0,
				deleted: input.districts.deletedVals?.length ?? 0,
			},
		}),
	}),
	addToArea: getTRPCMock({
		path: ['serviceArea', 'addToArea'],
		type: 'mutation',
		response: () => ({ result: 'added' }),
	}),
	delFromArea: getTRPCMock({
		path: ['serviceArea', 'delFromArea'],
		type: 'mutation',
		response: () => ({ result: 'deleted' }),
	}),
} satisfies MockHandlerObject<'serviceArea'>
