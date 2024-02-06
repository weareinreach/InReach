import { defineRouter, importHandler, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'page'

const namespaced = (s: string) => `${NAMESPACE}.${s}`

export const pageRouter = defineRouter({
	serviceEdit: permissionedProcedure('createOrgService')
		.input(schema.ZServiceEditSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('serviceEdit'),
				() => import('./query.serviceEdit.handler')
			)
			return handler(opts)
		}),
	LocationEditUpdate: permissionedProcedure('updateLocation')
		.input(schema.ZLocationEditUpdateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('LocationEditUpdate'),
				() => import('./mutation.LocationEditUpdate.handler')
			)
			return handler(opts)
		}),
})
