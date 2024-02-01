import { defineRouter, importHandler, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'orgSocialMedia'

const namespaced = (s: string) => `${NAMESPACE}.${s}`
export const orgSocialMediaRouter = defineRouter({
	create: permissionedProcedure('createNewSocial')
		.input(schema.ZCreateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('create'), () => import('./mutation.create.handler'))
			return handler(opts)
		}),
	update: permissionedProcedure('updateSocialMedia')
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
	forContactInfoEdits: permissionedProcedure('updateSocialMedia')
		.input(schema.ZForContactInfoEditsSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('forContactInfoEdits'),
				() => import('./query.forContactInfoEdits.handler')
			)
			return handler(opts)
		}),
	getServiceTypes: permissionedProcedure('updateSocialMedia')
		.input(schema.ZGetServiceTypesSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('getServiceTypes'),
				() => import('./query.getServiceTypes.handler')
			)
			return handler(opts)
		}),
	forEditDrawer: permissionedProcedure('updateSocialMedia')
		.input(schema.ZForEditDrawerSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('forEditDrawer'),
				() => import('./query.forEditDrawer.handler')
			)
			return handler(opts)
		}),
})
