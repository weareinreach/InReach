import { defineRouter, protectedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const HandlerCache: Partial<UserListHandlerCache> = {}

type UserListHandlerCache = {
	getAll: typeof import('./query.getAll.handler').getAll
	getById: typeof import('./query.getById.handler').getById
	getByUrl: typeof import('./query.getByUrl.handler').getByUrl
	isSaved: typeof import('./query.isSaved.handler').isSaved
	create: typeof import('./mutation.create.handler').create
	createAndSaveItem: typeof import('./mutation.createAndSaveItem.handler').createAndSaveItem
	delete: typeof import('./mutation.delete.handler').deleteList
	saveItem: typeof import('./mutation.saveItem.handler').saveItem
	deleteItem: typeof import('./mutation.deleteItem.handler').deleteItem
	shareUrl: typeof import('./mutation.shareUrl.handler').shareUrl
	unShareUrl: typeof import('./mutation.unShareUrl.handler').unShareUrl
}

export const savedListRouter = defineRouter({
	/** Get all saved lists for logged in user */
	getAll: protectedProcedure.query(async ({ ctx }) => {
		if (!HandlerCache.getAll)
			HandlerCache.getAll = await import('./query.getAll.handler').then((mod) => mod.getAll)
		if (!HandlerCache.getAll) throw new Error('Failed to load handler')
		return HandlerCache.getAll({ ctx })
	}),
	/** Get list by ID. List must be owned by or shared with logged in user */
	getById: protectedProcedure.input(schema.ZGetByIdSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getById)
			HandlerCache.getById = await import('./query.getById.handler').then((mod) => mod.getById)
		if (!HandlerCache.getById) throw new Error('Failed to load handler')
		return HandlerCache.getById({ ctx, input })
	}),
	/** Get list by shared URL slug */
	getByUrl: publicProcedure.input(schema.ZGetByUrlSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getByUrl)
			HandlerCache.getByUrl = await import('./query.getByUrl.handler').then((mod) => mod.getByUrl)
		if (!HandlerCache.getByUrl) throw new Error('Failed to load handler')
		return HandlerCache.getByUrl({ ctx, input })
	}),
	/** Create list for logged in user */
	create: protectedProcedure.input(schema.ZCreateSchema().inputSchema).mutation(async ({ ctx, input }) => {
		if (!HandlerCache.create)
			HandlerCache.create = await import('./mutation.create.handler').then((mod) => mod.create)
		if (!HandlerCache.create) throw new Error('Failed to load handler')
		return HandlerCache.create({ ctx, input })
	}),
	/** Create a new list and save an organization or service to it */
	createAndSaveItem: protectedProcedure
		.input(schema.ZCreateAndSaveItemSchema().inputSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.createAndSaveItem)
				HandlerCache.createAndSaveItem = await import('./mutation.createAndSaveItem.handler').then(
					(mod) => mod.createAndSaveItem
				)
			if (!HandlerCache.createAndSaveItem) throw new Error('Failed to load handler')
			return HandlerCache.createAndSaveItem({ ctx, input })
		}),
	/** Delete list by id for current logged in user */
	delete: protectedProcedure.input(schema.ZDeleteSchema).mutation(async ({ ctx, input }) => {
		if (!HandlerCache.delete)
			HandlerCache.delete = await import('./mutation.delete.handler').then((mod) => mod.deleteList)
		if (!HandlerCache.delete) throw new Error('Failed to load handler')
		return HandlerCache.delete({ ctx, input })
	}),

	saveItem: protectedProcedure
		.input(schema.ZSaveItemSchema().inputSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.saveItem)
				HandlerCache.saveItem = await import('./mutation.saveItem.handler').then((mod) => mod.saveItem)
			if (!HandlerCache.saveItem) throw new Error('Failed to load handler')
			return HandlerCache.saveItem({ ctx, input })
		}),
	deleteItem: protectedProcedure
		.input(schema.ZDeleteItemSchema().inputSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.deleteItem)
				HandlerCache.deleteItem = await import('./mutation.deleteItem.handler').then((mod) => mod.deleteItem)
			if (!HandlerCache.deleteItem) throw new Error('Failed to load handler')
			return HandlerCache.deleteItem({ ctx, input })
		}),

	/**
	 * Create url to share list
	 *
	 * List will be viewable by anyone who has this link.
	 */
	shareUrl: protectedProcedure.input(schema.ZShareUrlSchema).mutation(async ({ ctx, input }) => {
		if (!HandlerCache.shareUrl)
			HandlerCache.shareUrl = await import('./mutation.shareUrl.handler').then((mod) => mod.shareUrl)
		if (!HandlerCache.shareUrl) throw new Error('Failed to load handler')
		return HandlerCache.shareUrl({ ctx, input })
	}),
	/**
	 * Delete shared URL
	 *
	 * Anyone who visits the old URL will be presented a 404
	 */
	unShareUrl: protectedProcedure.input(schema.ZUnShareUrlSchema).mutation(async ({ ctx, input }) => {
		if (!HandlerCache.unShareUrl)
			HandlerCache.unShareUrl = await import('./mutation.unShareUrl.handler').then((mod) => mod.unShareUrl)
		if (!HandlerCache.unShareUrl) throw new Error('Failed to load handler')
		return HandlerCache.unShareUrl({ ctx, input })
	}),
	isSaved: publicProcedure.input(schema.ZIsSavedSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.isSaved)
			HandlerCache.isSaved = await import('./query.isSaved.handler').then((mod) => mod.isSaved)
		if (!HandlerCache.isSaved) throw new Error('Failed to load handler')
		return HandlerCache.isSaved({ ctx, input })
	}),
})
