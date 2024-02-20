import { getTRPCMock, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const orgWebsite = {
	forContactInfo: getTRPCMock({
		path: ['orgWebsite', 'forContactInfo'],
		type: 'query',
		response: async ({ locationOnly }) => {
			const { default: data } = await import('./json/orgWebsite.forContactInfo.json')
			return locationOnly !== undefined
				? data.filter((record) => record.orgLocationOnly === locationOnly)
				: data
		},
	}),
	forEditDrawer: getTRPCMock({
		path: ['orgWebsite', 'forEditDrawer'],
		type: 'query',
		response: async () => {
			const { default: data } = await import('./json/orgWebsite.forEditDrawer.json')
			return {
				description: undefined,
				...data,
				createdAt: new Date(data.createdAt),
				updatedAt: new Date(data.updatedAt),
			}
		},
	}),
	update: getTRPCMock({
		path: ['orgWebsite', 'update'],
		type: 'mutation',
		response: async (input) => {
			const { default: data } = await import('./json/orgWebsite.forEditDrawer.json')
			return { ...data, ...input.data, createdAt: new Date(data.createdAt), updatedAt: new Date(Date.now()) }
		},
	}),
	forContactInfoEdit: getTRPCMock({
		path: ['orgWebsite', 'forContactInfoEdit'],
		type: 'query',
		response: async () => {
			const { default: data } = await import('./json/orgWebsite.forContactInfoEdit.json')
			return data
		},
	}),
} satisfies MockHandlerObject<'orgWebsite'>
