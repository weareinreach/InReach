import { defineRouter, importHandler, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'orgWebsite'

const namespaced = (s: string) => `${NAMESPACE}.${s}`
export const orgWebsiteRouter = defineRouter({
	create: permissionedProcedure('createOrgWebsite')
		.input(schema.ZCreateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('create'), () => import('./mutation.create.handler'))
			return handler(opts)
		}),
	update: permissionedProcedure('updateOrgWebsite')
		.input(schema.ZUpdateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('update'), () => import('./mutation.update.handler'))
			return handler(opts)
		}),
	forContactInfo: publicProcedure.input(schema.ZForContactInfoSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('forContactInfo'),
			() => import('./query.forContactInfo.handler')
		)
		return handler(opts)
	}),
	forEditDrawer: permissionedProcedure('updateOrgWebsite')
		.input(schema.ZForEditDrawerSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('forEditDrawer'),
				() => import('./query.forEditDrawer.handler')
			)
			return handler(opts)
		}),
	forContactInfoEdit: permissionedProcedure('updateOrgWebsite')
		.input(schema.ZForContactInfoEditSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('forContactInfoEdit'),
				() => import('./query.forContactInfoEdit.handler')
			)
			return handler(opts)
		}),
})
