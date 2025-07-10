import { getTRPCMock, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const user = {
	surveyOptions: getTRPCMock({
		path: ['user', 'surveyOptions'],
		response: async () => {
			const data = (await import('./json/user.surveyOptions.json')).default
			return data
		},
	}),
	forUserTable: getTRPCMock({
		path: ['user', 'forUserTable'],
		response: async (filterInput) => {
			const data = (await import('./json/user.forUserTable.json')).default
			const reformatted = data.map((item) => ({
				...item,
				createdAt: new Date(item.createdAt),
				updatedAt: new Date(item.updatedAt),
				...(item.emailVerified ? { emailVerified: new Date(item.emailVerified) } : { emailVerified: null }),
			}))
			if (filterInput?.active !== undefined) {
				return reformatted.filter((item) => filterInput.active === item.active)
			}
			return reformatted
		},
	}),
} satisfies MockHandlerObject<'user'>
