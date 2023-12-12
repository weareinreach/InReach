import { getTRPCMock, type MockDataObject, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const serviceAreaData = {
	getServiceArea: {
		id: 'svar_01GW2HT8D1B1RET8SVAETPBH05',
		countries: [],
		districts: [
			{
				govDist: {
					id: 'gdst_01GW2HJ23GMD17FBJMJWD16PZ1',
					parent: null,
					countryId: 'ctry_01GW2HHDK9M26M80SG63T21SVH',
					tsKey: 'us-california',
					tsNs: 'gov-dist',
				},
			},
			{
				govDist: {
					id: 'gdst_01GW2HJ2S1061RNRAT6S4RJN1S',
					parent: {
						id: 'gdst_01GW2HJ23GMD17FBJMJWD16PZ1',
						tsKey: 'us-california',
						tsNs: 'gov-dist',
					},
					countryId: 'ctry_01GW2HHDK9M26M80SG63T21SVH',
					tsKey: 'us-california-san-francisco-county',
					tsNs: 'gov-dist',
				},
			},
		],
	},
} satisfies MockDataObject<'serviceArea'>

export const serviceArea = {
	getServiceArea: getTRPCMock({
		path: ['serviceArea', 'getServiceArea'],
		response: serviceAreaData.getServiceArea,
	}),
} satisfies MockHandlerObject<'serviceArea'>
