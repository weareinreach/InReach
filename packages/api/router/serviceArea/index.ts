import { defineRouter, importHandler, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'serviceArea'

const namespaced = (s: string) => `${NAMESPACE}.${s}`
export const serviceAreaRouter = defineRouter({
	getServiceArea: publicProcedure.input(schema.ZGetServiceAreaSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('getServiceArea'),
			() => import('./query.getServiceArea.handler')
		)
		return handler(opts)
	}),
	update: permissionedProcedure('updateOrgService')
		.input(schema.ZUpdateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('update'), () => import('./mutation.update.handler'))
			return handler(opts)
		}),
})
