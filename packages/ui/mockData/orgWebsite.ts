import { getTRPCMock, type MockDataObject, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const orgWebsiteData = {
	forContactInfo: [
		{
			id: 'oweb_01GW2HT9ETW73ZW159JW0BSKN6',
			url: 'https://www.whitman-walker.org',
			isPrimary: false,
			orgLocationOnly: false,
			description: null,
		},
	],
} satisfies MockDataObject<'orgWebsite'>

export const orgWebsite = {
	forContactInfo: getTRPCMock({
		path: ['orgWebsite', 'forContactInfo'],
		type: 'query',
		response: ({ locationOnly }) =>
			locationOnly !== undefined
				? orgWebsiteData.forContactInfo.filter((record) => record.orgLocationOnly === locationOnly)
				: orgWebsiteData.forContactInfo,
	}),
} satisfies MockHandlerObject<'orgWebsite'>
