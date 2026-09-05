import { defineRouter, importHandler, permissionedProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'bulkSearchReplace'

const namespaced = (s: string) => `${NAMESPACE}.${s}`

// Every procedure here is gated `dataPortalManager` explicitly, on its own - never reused from a
// lower-gated sibling procedure elsewhere in the app, even where the underlying write logic is similar.
export const bulkSearchReplaceRouter = defineRouter({
	search: permissionedProcedure('dataPortalManager')
		.input(schema.ZBulkSearchReplaceSchema)
		.query(async (opts) => {
			const handler = await importHandler(namespaced('search'), () => import('./query.search.handler'))
			return handler(opts)
		}),
	replaceText: permissionedProcedure('dataPortalManager')
		.input(schema.ZReplaceTextSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('replaceText'),
				() => import('./mutation.replaceText.handler')
			)
			return handler(opts)
		}),
})
