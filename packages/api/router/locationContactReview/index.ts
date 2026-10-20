import { defineRouter, importHandler, permissionedProcedure } from '~api/lib/trpc'

import { ZDecideSchema } from './mutation.decide.schema'

const NAMESPACE = 'locationContactReview'

const namespaced = (s: string) => `${NAMESPACE}.${s}`

/**
 * The data managers' review list for the location-vs-organization contact cleanup (data migration
 * 2026-10-19_location-contact-cleanup) - Manager and up, same as the page that shows it
 * (/data-portal/location-phone-cleanup).
 */
export const locationContactReviewRouter = defineRouter({
	list: permissionedProcedure('dataPortalManager').query(async () => {
		const handler = await importHandler(namespaced('list'), () => import('./query.list.handler'))
		return handler()
	}),
	decide: permissionedProcedure('dataPortalManager')
		.input(ZDecideSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('decide'), () => import('./mutation.decide.handler'))
			return handler(opts)
		}),
})
