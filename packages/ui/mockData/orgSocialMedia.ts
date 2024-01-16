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
	forContactInfoEdits: getTRPCMock({
		path: ['orgSocialMedia', 'forContactInfoEdits'],
		type: 'query',
		response: async () => {
			const { default: data } = await import('./json/orgSocialMedia.forContactInfoEdits.json')
			return data
		},
	}),
} satisfies MockHandlerObject<'orgSocialMedia'>
