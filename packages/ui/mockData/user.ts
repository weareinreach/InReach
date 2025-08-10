import { type ApiOutput } from '@weareinreach/api'
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
		response: async () => {
			const data = (await import('./json/user.forUserTable.json')).default
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const typedData: NonNullable<ApiOutput['user']['forUserTable']> = data.map((user: any) => ({
				...user,
				createdAt: new Date(user.createdAt),
				updatedAt: new Date(user.updatedAt),
				emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
				name: user.name === null ? null : String(user.name),
				canAccessDataPortal: user.canAccessDataPortal,
			}))
			return typedData
		},
	}),
} satisfies MockHandlerObject<'user'>
