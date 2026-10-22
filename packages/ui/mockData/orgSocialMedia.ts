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
			// Saved before the edit lists gained `linkedFromOrg` (an organization's edit list never flags it).
			return data.map((row) => ({ ...row, linkedFromOrg: false }))
		},
	}),
	getServiceTypes: getTRPCMock({
		path: ['orgSocialMedia', 'getServiceTypes'],
		type: 'query',
		response: async () => {
			const { default: data } = await import('./json/orgSocialMedia.getServiceTypes.json')
			return data
		},
	}),
	forEditDrawer: getTRPCMock({
		path: ['orgSocialMedia', 'forEditDrawer'],
		type: 'query',
		response: async () => {
			const { default: data } = await import('./json/orgSocialMedia.forEditDrawer.json')
			return data
		},
	}),
	update: getTRPCMock({
		path: ['orgSocialMedia', 'update'],
		type: 'mutation',
		response: async (input) => {
			const { default: data } = await import('./json/orgSocialMedia.forEditDrawer.json')
			return { ...data, ...input }
		},
	}),
} satisfies MockHandlerObject<'orgSocialMedia'>
