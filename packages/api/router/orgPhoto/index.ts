import { defineRouter, importHandler, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'orgPhoto'

const namespaced = (s: string) => `${NAMESPACE}.${s}`
export const orgPhotoRouter = defineRouter({
	create: permissionedProcedure('createPhoto')
		.input(schema.ZCreateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('create'), () => import('./mutation.create.handler'))
			return handler(opts)
		}),
	update: permissionedProcedure('updatePhoto')
		.input(schema.ZUpdateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('update'), () => import('./mutation.update.handler'))
			return handler(opts)
		}),
	getByParent: publicProcedure.input(schema.ZGetByParentSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('getByParent'),
			() => import('./query.getByParent.handler')
		)
		return handler(opts)
	}),
})
