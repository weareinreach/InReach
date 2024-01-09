import { getTRPCMock, type MockHandlerObject } from '~ui/lib/getTrpcMock'

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
		response: async (input) => {
			const { default: data } = await import('./json/orgPhone.update.json')
			return { ...data, ...input, createdAt: new Date(data.createdAt), updatedAt: new Date(data.updatedAt) }
		},
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
		response: async () => {
			const { default: data } = await import(`./json/orgPhone.forEditDrawer.json`)
			return data
		},
	}),
	forContactInfoEdit: getTRPCMock({
		path: ['orgPhone', 'forContactInfoEdit'],
		type: 'query',
		response: async () => {
			const { default: data } = await import(`./json/orgPhone.forContactInfoEdit.json`)
			return data
		},
	}),
} satisfies MockHandlerObject<'orgPhone'>
