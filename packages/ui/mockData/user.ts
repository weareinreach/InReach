import { getTRPCMock, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const user = {
	surveyOptions: getTRPCMock({
		path: ['user', 'surveyOptions'],
		response: async () => {
			const data = (await import('./json/user.surveyOptions.json')).default
			return data
		},
	}),
} satisfies MockHandlerObject<'user'>
