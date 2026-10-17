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
			const results: NonNullable<ApiOutput['user']['forUserTable']>['results'] = data.map((entry: any) => ({
				...entry,
				createdAt: new Date(entry.createdAt),
				updatedAt: new Date(entry.updatedAt),
				emailVerified: entry.emailVerified ? new Date(entry.emailVerified) : null,
				name: entry.name === null ? null : String(entry.name),
				canAccessDataPortal: entry.canAccessDataPortal,
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
					(entry) =>
						search.length >= 2 &&
						(entry.name?.toLowerCase().includes(search) || entry.email.toLowerCase().includes(search))
				)
				.slice(0, 10)
				.map((entry) => ({ id: entry.id, name: entry.name, email: entry.email }))
		},
	}),
} satisfies MockHandlerObject<'user'>
