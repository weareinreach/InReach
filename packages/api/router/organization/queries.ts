/* eslint-disable @typescript-eslint/consistent-type-imports */
import { defineRouter, protectedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

type OrgQueryHandlerCache = {
	getById: typeof import('./query.getById.handler').getById
	getBySlug: typeof import('./query.getBySlug.handler').getBySlug
	getIdFromSlug: typeof import('./query.getIdFromSlug.handler').getIdFromSlug
	searchName: typeof import('./query.searchName.handler').searchName
	searchDistance: typeof import('./query.searchDistance.handler').searchDistance
	getNameFromSlug: typeof import('./query.getNameFromSlug.handler').getNameFromSlug
	isSaved: typeof import('./query.isSaved.handler').isSaved
	suggestionOptions: typeof import('./query.suggestionOptions.handler').suggestionOptions
	checkForExisting: typeof import('./query.checkForExisting.handler').checkForExisting
	generateSlug: typeof import('./query.generateSlug.handler').generateSlug
	forOrgPage: typeof import('./query.forOrgPage.handler').forOrgPage
	forLocationPage: typeof import('./query.forLocationPage.handler').forLocationPage
	slugRedirect: typeof import('./query.slugRedirect.handler').slugRedirect
	getIntlCrisis: typeof import('./query.getIntlCrisis.handler').getIntlCrisis
}

const HandlerCache: Partial<OrgQueryHandlerCache> = {}

export const queries = defineRouter({
	getById: publicProcedure.input(schema.ZGetByIdSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getById)
			HandlerCache.getById = await import('./query.getById.handler').then((mod) => mod.getById)

		if (!HandlerCache.getById) throw new Error('Failed to load handler')
		return HandlerCache.getById({ ctx, input })
	}),
	getBySlug: publicProcedure.input(schema.ZGetBySlugSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getBySlug)
			HandlerCache.getBySlug = await import('./query.getBySlug.handler').then((mod) => mod.getBySlug)

		if (!HandlerCache.getBySlug) throw new Error('Failed to load handler')
		return HandlerCache.getBySlug({ ctx, input })
	}),
	getIdFromSlug: publicProcedure.input(schema.ZGetIdFromSlugSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getIdFromSlug)
			HandlerCache.getIdFromSlug = await import('./query.getIdFromSlug.handler').then(
				(mod) => mod.getIdFromSlug
			)

		if (!HandlerCache.getIdFromSlug) throw new Error('Failed to load handler')
		return HandlerCache.getIdFromSlug({ ctx, input })
	}),
	searchName: publicProcedure.input(schema.ZSearchNameSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.searchName)
			HandlerCache.searchName = await import('./query.searchName.handler').then((mod) => mod.searchName)

		if (!HandlerCache.searchName) throw new Error('Failed to load handler')
		return HandlerCache.searchName({ ctx, input })
	}),
	searchDistance: publicProcedure.input(schema.ZSearchDistanceSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.searchDistance)
			HandlerCache.searchDistance = await import('./query.searchDistance.handler').then(
				(mod) => mod.searchDistance
			)

		if (!HandlerCache.searchDistance) throw new Error('Failed to load handler')
		return HandlerCache.searchDistance({ ctx, input })
	}),
	getNameFromSlug: publicProcedure.input(schema.ZGetNameFromSlugSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getNameFromSlug)
			HandlerCache.getNameFromSlug = await import('./query.getNameFromSlug.handler').then(
				(mod) => mod.getNameFromSlug
			)

		if (!HandlerCache.getNameFromSlug) throw new Error('Failed to load handler')
		return HandlerCache.getNameFromSlug({ ctx, input })
	}),
	isSaved: publicProcedure.input(schema.ZIsSavedSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.isSaved)
			HandlerCache.isSaved = await import('./query.isSaved.handler').then((mod) => mod.isSaved)

		if (!HandlerCache.isSaved) throw new Error('Failed to load handler')
		return HandlerCache.isSaved({ ctx, input })
	}),
	suggestionOptions: publicProcedure.query(async ({ ctx }) => {
		if (!HandlerCache.suggestionOptions)
			HandlerCache.suggestionOptions = await import('./query.suggestionOptions.handler').then(
				(mod) => mod.suggestionOptions
			)

		if (!HandlerCache.suggestionOptions) throw new Error('Failed to load handler')
		return HandlerCache.suggestionOptions()
	}),
	checkForExisting: publicProcedure.input(schema.ZCheckForExistingSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.checkForExisting)
			HandlerCache.checkForExisting = await import('./query.checkForExisting.handler').then(
				(mod) => mod.checkForExisting
			)

		if (!HandlerCache.checkForExisting) throw new Error('Failed to load handler')
		return HandlerCache.checkForExisting({ ctx, input })
	}),
	generateSlug: protectedProcedure.input(schema.ZGenerateSlugSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.generateSlug)
			HandlerCache.generateSlug = await import('./query.generateSlug.handler').then((mod) => mod.generateSlug)

		if (!HandlerCache.generateSlug) throw new Error('Failed to load handler')
		return HandlerCache.generateSlug({ ctx, input })
	}),
	forOrgPage: publicProcedure.input(schema.ZForOrgPageSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.forOrgPage)
			HandlerCache.forOrgPage = await import('./query.forOrgPage.handler').then((mod) => mod.forOrgPage)

		if (!HandlerCache.forOrgPage) throw new Error('Failed to load handler')
		return HandlerCache.forOrgPage({ ctx, input })
	}),
	forLocationPage: publicProcedure.input(schema.ZForLocationPageSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.forLocationPage)
			HandlerCache.forLocationPage = await import('./query.forLocationPage.handler').then(
				(mod) => mod.forLocationPage
			)

		if (!HandlerCache.forLocationPage) throw new Error('Failed to load handler')
		return HandlerCache.forLocationPage({ ctx, input })
	}),
	slugRedirect: publicProcedure.input(schema.ZSlugRedirectSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.slugRedirect)
			HandlerCache.slugRedirect = await import('./query.slugRedirect.handler').then((mod) => mod.slugRedirect)

		if (!HandlerCache.slugRedirect) throw new Error('Failed to load handler')
		return HandlerCache.slugRedirect({ ctx, input })
	}),
	getIntlCrisis: publicProcedure.input(schema.ZGetIntlCrisisSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getIntlCrisis)
			HandlerCache.getIntlCrisis = await import('./query.getIntlCrisis.handler').then(
				(mod) => mod.getIntlCrisis
			)

		if (!HandlerCache.getIntlCrisis) throw new Error('Failed to load handler')
		return HandlerCache.getIntlCrisis({ ctx, input })
	}),
})
