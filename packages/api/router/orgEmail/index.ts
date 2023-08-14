import { defineRouter, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const HandlerCache: Partial<OrgEmailHandlerCache> = {}
type OrgEmailHandlerCache = {
	create: typeof import('./mutation.create.handler').create
	update: typeof import('./mutation.update.handler').update
	upsertMany: typeof import('./mutation.upsertMany.handler').upsertMany
	get: typeof import('./query.get.handler').get
	forContactInfo: typeof import('./query.forContactInfo.handler').forContactInfo
}
export const orgEmailRouter = defineRouter({
	create: permissionedProcedure('createNewEmail')
		.input(schema.ZCreateSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.create)
				HandlerCache.create = await import('./mutation.create.handler').then((mod) => mod.create)
			if (!HandlerCache.create) throw new Error('Failed to load handler')
			return HandlerCache.create({ ctx, input })
		}),
	update: permissionedProcedure('updateEmail')
		.input(schema.ZUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.update)
				HandlerCache.update = await import('./mutation.update.handler').then((mod) => mod.update)
			if (!HandlerCache.update) throw new Error('Failed to load handler')
			return HandlerCache.update({ ctx, input })
		}),
	get: permissionedProcedure('createNewEmail')
		.input(schema.ZGetSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.get) HandlerCache.get = await import('./query.get.handler').then((mod) => mod.get)
			if (!HandlerCache.get) throw new Error('Failed to load handler')
			return HandlerCache.get({ ctx, input })
		}),
	upsertMany: permissionedProcedure('updateEmail')
		.input(schema.ZUpsertManySchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.upsertMany)
				HandlerCache.upsertMany = await import('./mutation.upsertMany.handler').then((mod) => mod.upsertMany)
			if (!HandlerCache.upsertMany) throw new Error('Failed to load handler')
			return HandlerCache.upsertMany({ ctx, input })
		}),
	forContactInfo: publicProcedure.input(schema.ZForContactInfoSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.forContactInfo)
			HandlerCache.forContactInfo = await import('./query.forContactInfo.handler').then(
				(mod) => mod.forContactInfo
			)
		if (!HandlerCache.forContactInfo) throw new Error('Failed to load handler')
		return HandlerCache.forContactInfo({ ctx, input })
	}),
})
