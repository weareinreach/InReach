import { defineRouter, importHandler, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'orgEmail'

const namespaced = (s: string) => `${NAMESPACE}.${s}`

export const orgEmailRouter = defineRouter({
	create: permissionedProcedure('createNewEmail')
		.input(schema.ZCreateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('create'), () => import('./mutation.create.handler'))
			return handler(opts)
		}),
	update: permissionedProcedure('updateEmail')
		.input(schema.ZUpdateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('update'), () => import('./mutation.update.handler'))
			return handler(opts)
		}),
	get: permissionedProcedure('createNewEmail')
		.input(schema.ZGetSchema)
		.query(async (opts) => {
			const handler = await importHandler(namespaced('get'), () => import('./query.get.handler'))
			return handler(opts)
		}),
	upsertMany: permissionedProcedure('updateEmail')
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
	forContactInfoEdit: permissionedProcedure('updateEmail')
		.input(schema.ZForContactInfoEditSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('forContactInfoEdit'),
				() => import('./query.forContactInfoEdit.handler')
			)
			return handler(opts)
		}),
	forEditDrawer: permissionedProcedure('updateEmail')
		.input(schema.ZForEditDrawerSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('forEditDrawer'),
				() => import('./query.forEditDrawer.handler')
			)
			return handler(opts)
		}),
	getLinkOptions: permissionedProcedure('updateEmail')
		.input(schema.ZGetLinkOptionsSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('getLinkOptions'),
				() => import('./query.getLinkOptions.handler')
			)
			return handler(opts)
		}),
	locationLink: permissionedProcedure('updateEmail')
		.input(schema.ZLocationLinkSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('locationLink'),
				() => import('./mutation.locationLink.handler')
			)
			return handler(opts)
		}),
})
