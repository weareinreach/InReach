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
	addToArea: permissionedProcedure('updateOrgService')
		.input(schema.ZAddToAreaSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('addToArea'),
				() => import('./mutation.addToArea.handler')
			)
			return handler(opts)
		}),
	delFromArea: permissionedProcedure('updateOrgService')
		.input(schema.ZDelFromAreaSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('delFromArea'),
				() => import('./mutation.delFromArea.handler')
			)
			return handler(opts)
		}),
})
