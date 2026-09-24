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
			const results: NonNullable<ApiOutput['user']['forUserTable']>['results'] = data.map((user: any) => ({
				...user,
				createdAt: new Date(user.createdAt),
				updatedAt: new Date(user.updatedAt),
				emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
				name: user.name === null ? null : String(user.name),
				canAccessDataPortal: user.canAccessDataPortal,
			}))
			return { results, total: results.length }
		},
	}),
	// Backs the "Created By" type-ahead filter on the Organization/Review/Report data-portal tables -
	// reuses the same fixture dataset as forUserTable rather than maintaining a second one.
	searchTypeahead: getTRPCMock({
		path: ['user', 'searchTypeahead'],
		response: async (input) => {
			const data = (await import('./json/user.forUserTable.json')).default
			const search = input.search.trim().toLowerCase()
			return data
				.filter(
					(user) =>
						search.length >= 2 &&
						(user.name?.toLowerCase().includes(search) || user.email.toLowerCase().includes(search))
				)
				.slice(0, 10)
				.map((user) => ({ id: user.id, name: user.name, email: user.email }))
		},
	}),
} satisfies MockHandlerObject<'user'>
