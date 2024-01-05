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
} satisfies MockHandlerObject<'orgWebsite'>
