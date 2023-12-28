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
		response: orgWebsiteData.forEditDrawer,
	}),
	update: getTRPCMock({
		path: ['orgWebsite', 'update'],
		type: 'mutation',
		response: (input) => ({ ...orgWebsiteData.forEditDrawer, ...input.data }),
	}),
} satisfies MockHandlerObject<'orgWebsite'>
