import { defineRouter, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const HandlerCache: Partial<OrgPhotoHandlerCache> = {}
type OrgPhotoHandlerCache = {
	create: typeof import('./mutation.create.handler').create
	update: typeof import('./mutation.update.handler').update
	getByParent: typeof import('./query.getByParent.handler').getByParent
}

export const orgPhotoRouter = defineRouter({
	create: permissionedProcedure('createPhoto')
		.input(schema.ZCreateSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.create)
				HandlerCache.create = await import('./mutation.create.handler').then((mod) => mod.create)
			if (!HandlerCache.create) throw new Error('Failed to load handler')
			return HandlerCache.create({ ctx, input })
		}),
	update: permissionedProcedure('updatePhoto')
		.input(schema.ZUpdateSchema)
		.mutation(async ({ input, ctx }) => {
			if (!HandlerCache.update)
				HandlerCache.update = await import('./mutation.update.handler').then((mod) => mod.update)
			if (!HandlerCache.update) throw new Error('Failed to load handler')
			return HandlerCache.update({ ctx, input })
		}),
	getByParent: publicProcedure.input(schema.ZGetByParentSchema).query(async ({ input, ctx }) => {
		if (!HandlerCache.getByParent)
			HandlerCache.getByParent = await import('./query.getByParent.handler').then((mod) => mod.getByParent)
		if (!HandlerCache.getByParent) throw new Error('Failed to load handler')
		return HandlerCache.getByParent({ ctx, input })
	}),
})
