import { getTRPCMock, type MockDataObject, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const serviceAreaData = {
	getServiceArea: {
		id: 'svar_01GW2HT8D1B1RET8SVAETPBH05',
		countries: [],
		districts: [
			{
				id: 'gdst_01GW2HJ23GMD17FBJMJWD16PZ1',
				parent: null,
				country: { cca2: 'US' },
				tsKey: 'us-california',
				tsNs: 'gov-dist',
			},
			{
				id: 'gdst_01GW2HJ2S1061RNRAT6S4RJN1S',
				parent: {
					// id: 'gdst_01GW2HJ23GMD17FBJMJWD16PZ1',
					tsKey: 'us-california',
					tsNs: 'gov-dist',
				},
				country: { cca2: 'US' },
				tsKey: 'us-california-san-francisco-county',
				tsNs: 'gov-dist',
			},
		],
	},
} satisfies MockDataObject<'serviceArea'>

export const serviceArea = {
	getServiceArea: getTRPCMock({
		path: ['serviceArea', 'getServiceArea'],
		response: serviceAreaData.getServiceArea,
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
} satisfies MockHandlerObject<'serviceArea'>
