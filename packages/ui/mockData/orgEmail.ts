import { getTRPCMock, type MockDataObject, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const orgEmail = {
	get: getTRPCMock({
		path: ['orgEmail', 'get'],
		response: async () => {
			const { default: data } = await import('./json/orgEmail.get.json')
			return data
		},
	}),
	upsertMany: getTRPCMock({
		path: ['orgEmail', 'upsertMany'],
		type: 'mutation',
		response: () => [],
	}),
	forContactInfo: getTRPCMock({
		path: ['orgEmail', 'forContactInfo'],
		type: 'query',
		response: async ({ locationOnly, serviceOnly }) => {
			const { default: data } = await import('./json/orgEmail.forContactInfo.json')
			if (locationOnly !== undefined && serviceOnly !== undefined) {
				return data.filter(
					(record) => record.locationOnly === locationOnly && record.serviceOnly === serviceOnly
				)
			}
			if (locationOnly !== undefined) {
				return data.filter((record) => record.locationOnly === locationOnly)
			}
			if (serviceOnly !== undefined) {
				return data.filter((record) => record.serviceOnly === serviceOnly)
			}
			return data
		},
	}),
	forContactInfoEdit: getTRPCMock({
		path: ['orgEmail', 'forContactInfoEdit'],
		type: 'query',
		response: async () => {
			const { default: data } = await import('./json/orgEmail.forContactInfoEdit.json')
			return data
		},
	}),
	forEditDrawer: getTRPCMock({
		path: ['orgEmail', 'forEditDrawer'],
		type: 'query',
		response: async () => {
			const { default: data } = await import('./json/orgEmail.forEditDrawer.json')
			return data
		},
	}),
} satisfies MockHandlerObject<'orgEmail'>
