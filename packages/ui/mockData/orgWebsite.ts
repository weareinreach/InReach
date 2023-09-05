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
	forEditDrawer: {
		id: 'oweb_01H29ENF8JTJ3FNJ5BQXDH4PMA',
		url: 'https://recoverycafelexington.org/',
		descriptionId: null,
		isPrimary: false,
		deleted: false,
		published: true,
		organizationId: 'orgn_01H29CX1KRXD89404CG1D4TY6S',
		orgLocationId: null,
		orgLocationOnly: false,
		createdAt: new Date('2023-03-22T21:47:01.905Z'),
		updatedAt: new Date('2023-05-12T23:38:51.738Z'),
		description: undefined,
	},
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
	forEditDrawer: getTRPCMock({
		path: ['orgWebsite', 'forEditDrawer'],
		type: 'query',
		response: orgWebsiteData.forEditDrawer,
	}),
} satisfies MockHandlerObject<'orgWebsite'>
