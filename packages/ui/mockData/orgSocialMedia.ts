import { getTRPCMock, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const orgSocialMedia = {
	forContactInfo: getTRPCMock({
		path: ['orgSocialMedia', 'forContactInfo'],
		type: 'query',
		response: async ({ locationOnly }) => {
			const { default: data } = await import('./json/orgSocialMedia.forContactInfo.json')
			return locationOnly !== undefined
				? data.filter((record) => record.orgLocationOnly === locationOnly)
				: data
		},
	}),
} satisfies MockHandlerObject<'orgSocialMedia'>
