import {
	defineRouter,
	importHandler,
	permissionedProcedure, // Use this to activate meta checks
	protectedProcedure,
	publicProcedure,
} from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'suggestion'

const namespaced = (s: string) => `${NAMESPACE}.${s}`

export const suggestionRouter = defineRouter({
	forSuggestionTable: permissionedProcedure('viewAllSuggestions')
		.input(schema.ZForSuggestionTableSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('forSuggestionTable'),
				() => import('./query.forSuggestionTable.handler')
			)
			return handler(opts)
		}),
	toggleHandled: permissionedProcedure('toggleSuggestionHandled')
		.input(schema.ZToggleHandledSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('toggleHandled'),
				() => import('./mutation.toggleHandled.handler')
			)
			return handler(opts)
		}),
})
