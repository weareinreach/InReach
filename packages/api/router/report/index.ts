import { defineRouter, importHandler, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import { ZCreateSchema } from './mutation.create.schema'
import { ZUpdateSchema } from './mutation.update.schema'
import { ZForReportsTableSchema } from './query.forReportsTable.schema'

const NAMESPACE = 'report'

const namespaced = (s: string) => `${NAMESPACE}.${s}`

export const reportRouter = defineRouter({
	// #region Queries
	forReportsTable: permissionedProcedure('dataPortalManager')
		.input(ZForReportsTableSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('forReportsTable'),
				() => import('./query.forReportsTable.handler')
			)
			return handler(opts)
		}),
	// #endregion

	// #region Mutations
	update: permissionedProcedure('dataPortalManager')
		.input(ZUpdateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('update'), () => import('./mutation.update.handler'))
			return handler(opts)
		}),
	create: publicProcedure.input(ZCreateSchema).mutation(async (opts) => {
		const handler = await importHandler(namespaced('create'), () => import('./mutation.create.handler'))
		return handler(opts)
	}),
	// #endregion
})
