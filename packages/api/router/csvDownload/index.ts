import {
	defineRouter,
	importHandler,
	permissionedProcedure,
	protectedProcedure,
	publicProcedure,
} from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'csvDownload'

const namespaced = (s: string) => `${NAMESPACE}.${s}`
export const csvDownloadRouter = defineRouter({
	getAllPublishedForCSV: permissionedProcedure('dataPortalManager')
		.input(schema.ZGetAllPublishedForCSVSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('getAllPublishedForCSV'),
				() => import('./query.getAllPublishedForCSV.handler')
			)
			return handler(opts)
		}),
	getAllUnpublishedForCSV: permissionedProcedure('dataPortalManager')
		.input(schema.ZGetAllUnpublishedForCSVSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('getAllUnpublishedForCSV'),
				() => import('./query.getAllUnpublishedForCSV.handler')
			)
			return handler(opts)
		}),
})
