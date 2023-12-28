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
	update: getTRPCMock({
		path: ['orgPhone', 'update'],
		type: 'mutation',
		response: (input) => {},
	}),
	forContactInfo: getTRPCMock({
		path: ['orgPhone', 'forContactInfo'],
		type: 'query',
		response: async ({ locationOnly }) => {
			const { default: data } = await import(`./json/orgPhone.forContactInfo.json`)

			return locationOnly !== undefined ? data.filter((record) => record.locationOnly === locationOnly) : data
		},
	}),
	forEditDrawer: getTRPCMock({
		path: ['orgPhone', 'forEditDrawer'],
		type: 'query',
		response: orgPhoneData.forEditDrawer,
	}),
} satisfies MockHandlerObject<'orgPhone'>
