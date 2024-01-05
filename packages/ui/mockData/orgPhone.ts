import { getTRPCMock, type MockDataObject, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const orgPhone = {
	get: getTRPCMock({
		path: ['orgPhone', 'get'],
		response: async () => {
			const { default: data } = await import(`./json/orgPhone.get.json`)
			return data
		},
	}),
	upsertMany: getTRPCMock({
		path: ['orgPhone', 'upsertMany'],
		type: 'mutation',
		response: () => [],
	}),
	forContactInfo: getTRPCMock({
		path: ['orgPhone', 'forContactInfo'],
		type: 'query',
		response: async ({ locationOnly }) => {
			const { default: data } = await import(`./json/orgPhone.forContactInfo.json`)

			return locationOnly !== undefined ? data.filter((record) => record.locationOnly === locationOnly) : data
		},
	}),
} satisfies MockHandlerObject<'orgPhone'>
