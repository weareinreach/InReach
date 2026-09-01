import { defineRouter, importHandler, permissionedProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'dashboard'

const namespaced = (s: string) => `${NAMESPACE}.${s}`
export const dashboardRouter = defineRouter({
	unpublishedStatusSummary: permissionedProcedure('dataPortalManager')
		.input(schema.ZUnpublishedStatusSummarySchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('unpublishedStatusSummary'),
				() => import('./query.unpublishedStatusSummary.handler')
			)
			return handler(opts)
		}),
	unpublishedStatusWorklist: permissionedProcedure('dataPortalManager')
		.input(schema.ZUnpublishedStatusWorklistSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('unpublishedStatusWorklist'),
				() => import('./query.unpublishedStatusWorklist.handler')
			)
			return handler(opts)
		}),
})
