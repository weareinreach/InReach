import { getTRPCMock, type MockDataObject, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const orgSocialMediaData = {
	forContactInfo: [
		{
			id: 'osmd_01GVH3VEVDBV523DYH978RVD4P',
			url: 'https://www.linkedin.com/company/whitman-walker/',
			username: 'whitman-walker',
			orgLocationOnly: false,
			service: 'LinkedIn',
		},
		{
			id: 'osmd_01GVH3VEVDATZJAAVXWA7D357F',
			url: 'https://www.facebook.com/whitmanwalker',
			username: 'whitmanwalker',
			orgLocationOnly: false,
			service: 'Facebook',
		},
		{
			id: 'osmd_01GVH3VEVD6ZPA8SNC42X0RTM7',
			url: 'https://www.instagram.com/whitmanwalker/',
			username: 'whitmanwalker',
			orgLocationOnly: false,
			service: 'Instagram',
		},
		{
			id: 'osmd_01GVH3VEVDH90J5JDXYB5GRRWK',
			url: 'https://www.youtube.com/@whitmanwalker/featured',
			username: '',
			orgLocationOnly: false,
			service: 'YouTube',
		},
		{
			id: 'osmd_01GVH3VEVD93QH872SAPRYYCS2',
			url: 'https://twitter.com/whitmanwalker',
			username: 'whitmanwalker',
			orgLocationOnly: false,
			service: 'Twitter',
		},
	],
} satisfies MockDataObject<'orgSocialMedia'>

export const orgSocialMedia = {
	forContactInfo: getTRPCMock({
		path: ['orgSocialMedia', 'forContactInfo'],
		type: 'query',
		response: ({ locationOnly }) =>
			locationOnly !== undefined
				? orgSocialMediaData.forContactInfo.filter((record) => record.orgLocationOnly === locationOnly)
				: orgSocialMediaData.forContactInfo,
	}),
} satisfies MockHandlerObject<'orgSocialMedia'>
