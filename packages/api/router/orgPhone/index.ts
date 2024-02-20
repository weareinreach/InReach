import { defineRouter, importHandler, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'orgPhone'

const namespaced = (s: string) => `${NAMESPACE}.${s}`
export const orgPhoneRouter = defineRouter({
	create: permissionedProcedure('createNewPhone')
		.input(schema.ZCreateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('create'), () => import('./mutation.create.handler'))
			return handler(opts)
		}),
	update: permissionedProcedure('updatePhone')
		.input(schema.ZUpdateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('update'), () => import('./mutation.update.handler'))
			return handler(opts)
		}),
	get: permissionedProcedure('createNewPhone')
		.input(schema.ZGetSchema)
		.query(async (opts) => {
			const handler = await importHandler(namespaced('get'), () => import('./query.get.handler'))
			return handler(opts)
		}),
	upsertMany: permissionedProcedure('updatePhone')
		.input(schema.ZUpsertManySchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('upsertMany'),
				() => import('./mutation.upsertMany.handler')
			)
			return handler(opts)
		}),
	forContactInfo: publicProcedure.input(schema.ZForContactInfoSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('forContactInfo'),
			() => import('./query.forContactInfo.handler')
		)
		return handler(opts)
	}),
	forEditDrawer: permissionedProcedure('updatePhone')
		.input(schema.ZForEditDrawerSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('forEditDrawer'),
				() => import('./query.forEditDrawer.handler')
			)
			return handler(opts)
		}),
	forContactInfoEdit: permissionedProcedure('updatePhone')
		.input(schema.ZForContactInfoEditSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('forContactInfoEdit'),
				() => import('./query.forContactInfoEdit.handler')
			)
			return handler(opts)
		}),
	getLinkOptions: permissionedProcedure('updatePhone')
		.input(schema.ZGetLinkOptionsSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('getLinkOptions'),
				() => import('./query.getLinkOptions.handler')
			)
			return handler(opts)
		}),
	locationLink: permissionedProcedure('updatePhone')
		.input(schema.ZLocationLinkSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('locationLink'),
				() => import('./mutation.locationLink.handler')
			)
			return handler(opts)
		}),
})
