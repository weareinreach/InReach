import { defineRouter, importHandler, protectedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'savedLists'

const namespaced = (s: string) => `${NAMESPACE}.${s}`

export const savedListRouter = defineRouter({
	/** Get all saved lists for logged in user */
	getAll: protectedProcedure.query(async (opts) => {
		const handler = await importHandler(namespaced('getAll'), () => import('./query.getAll.handler'))
		return handler(opts)
	}),
	/** Get list by ID. List must be owned by or shared with logged in user */
	getById: protectedProcedure.input(schema.ZGetByIdSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('getById'), () => import('./query.getById.handler'))
		return handler(opts)
	}),
	/** Get list by shared URL slug */
	getByUrl: publicProcedure.input(schema.ZGetByUrlSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('getByUrl'), () => import('./query.getByUrl.handler'))
		return handler(opts)
	}),
	/** Create list for logged in user */
	create: protectedProcedure.input(schema.ZCreateSchema).mutation(async (opts) => {
		const handler = await importHandler(namespaced('create'), () => import('./mutation.create.handler'))
		return handler(opts)
	}),
	/** Create a new list and save an organization or service to it */
	createAndSaveItem: protectedProcedure.input(schema.ZCreateAndSaveItemSchema).mutation(async (opts) => {
		const handler = await importHandler(
			namespaced('createAndSaveItem'),
			() => import('./mutation.createAndSaveItem.handler')
		)
		return handler(opts)
	}),
	/** Delete list by id for current logged in user */
	delete: protectedProcedure.input(schema.ZDeleteSchema).mutation(async (opts) => {
		const handler = await importHandler(namespaced('delete'), () => import('./mutation.delete.handler'))
		return handler(opts)
	}),

	saveItem: protectedProcedure.input(schema.ZSaveItemSchema).mutation(async (opts) => {
		const handler = await importHandler(namespaced('saveItem'), () => import('./mutation.saveItem.handler'))
		return handler(opts)
	}),
	deleteItem: protectedProcedure.input(schema.ZDeleteItemSchema).mutation(async (opts) => {
		const handler = await importHandler(
			namespaced('deleteItem'),
			() => import('./mutation.deleteItem.handler')
		)
		return handler(opts)
	}),

	/**
	 * Create url to share list
	 *
	 * List will be viewable by anyone who has this link.
	 */
	shareUrl: protectedProcedure.input(schema.ZShareUrlSchema).mutation(async (opts) => {
		const handler = await importHandler(namespaced('shareUrl'), () => import('./mutation.shareUrl.handler'))
		return handler(opts)
	}),
	/**
	 * Delete shared URL
	 *
	 * Anyone who visits the old URL will be presented a 404
	 */
	unShareUrl: protectedProcedure.input(schema.ZUnShareUrlSchema).mutation(async (opts) => {
		const handler = await importHandler(
			namespaced('unShareUrl'),
			() => import('./mutation.unShareUrl.handler')
		)
		return handler(opts)
	}),
	isSaved: publicProcedure.input(schema.ZIsSavedSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('isSaved'), () => import('./query.isSaved.handler'))
		return handler(opts)
	}),
})
