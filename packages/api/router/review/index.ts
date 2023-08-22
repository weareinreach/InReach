import { defineRouter, permissionedProcedure, protectedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const HandlerCache: Partial<ReviewHandlerCache> = {}

type ReviewHandlerCache = {
	create: typeof import('./mutation.create.handler').create
	getCurrentUser: typeof import('./query.getCurrentUser.handler').getCurrentUser
	getByOrg: typeof import('./query.getByOrg.handler').getByOrg
	getByLocation: typeof import('./query.getByLocation.handler').getByLocation
	getByService: typeof import('./query.getByService.handler').getByService
	getByIds: typeof import('./query.getByIds.handler').getByIds
	getByUser: typeof import('./query.getByUser.handler').getByUser
	getAverage: typeof import('./query.getAverage.handler').getAverage
	getFeatured: typeof import('./query.getFeatured.handler').getFeatured
	hide: typeof import('./mutation.hide.handler').hide
	unHide: typeof import('./mutation.unHide.handler').unHide
	delete: typeof import('./mutation.delete.handler').deleteReview
	unDelete: typeof import('./mutation.unDelete.handler').unDelete
}

export const reviewRouter = defineRouter({
	create: protectedProcedure.input(schema.ZCreateSchema).mutation(async ({ ctx, input }) => {
		if (!HandlerCache.create)
			HandlerCache.create = await import('./mutation.create.handler').then((mod) => mod.create)
		if (!HandlerCache.create) throw new Error('Failed to load handler')
		return HandlerCache.create({ ctx, input })
	}),
	getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
		if (!HandlerCache.getCurrentUser)
			HandlerCache.getCurrentUser = await import('./query.getCurrentUser.handler').then(
				(mod) => mod.getCurrentUser
			)
		if (!HandlerCache.getCurrentUser) throw new Error('Failed to load handler')
		return HandlerCache.getCurrentUser({ ctx })
	}),
	getByOrg: publicProcedure.input(schema.ZGetByOrgSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getByOrg)
			HandlerCache.getByOrg = await import('./query.getByOrg.handler').then((mod) => mod.getByOrg)
		if (!HandlerCache.getByOrg) throw new Error('Failed to load handler')
		return HandlerCache.getByOrg({ ctx, input })
	}),
	getByLocation: publicProcedure.input(schema.ZGetByLocationSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getByLocation)
			HandlerCache.getByLocation = await import('./query.getByLocation.handler').then(
				(mod) => mod.getByLocation
			)
		if (!HandlerCache.getByLocation) throw new Error('Failed to load handler')
		return HandlerCache.getByLocation({ ctx, input })
	}),
	getByService: publicProcedure.input(schema.ZGetByServiceSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getByService)
			HandlerCache.getByService = await import('./query.getByService.handler').then((mod) => mod.getByService)
		if (!HandlerCache.getByService) throw new Error('Failed to load handler')
		return HandlerCache.getByService({ ctx, input })
	}),
	/** Returns user reviews ready for public display. Takes reviewer's privacy preferences in to account */
	getByIds: publicProcedure.input(schema.ZGetByIdsSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getByIds)
			HandlerCache.getByIds = await import('./query.getByIds.handler').then((mod) => mod.getByIds)
		if (!HandlerCache.getByIds) throw new Error('Failed to load handler')
		return HandlerCache.getByIds({ ctx, input })
	}),
	getByUser: permissionedProcedure('viewUserReviews')
		.input(schema.ZGetByUserSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.getByUser)
				HandlerCache.getByUser = await import('./query.getByUser.handler').then((mod) => mod.getByUser)
			if (!HandlerCache.getByUser) throw new Error('Failed to load handler')
			return HandlerCache.getByUser({ ctx, input })
		}),
	hide: permissionedProcedure('hideUserReview')
		.input(schema.ZHideSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.hide)
				HandlerCache.hide = await import('./mutation.hide.handler').then((mod) => mod.hide)
			if (!HandlerCache.hide) throw new Error('Failed to load handler')
			return HandlerCache.hide({ ctx, input })
		}),
	unHide: permissionedProcedure('unHideUserReview')
		.input(schema.ZUnHideSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.unHide)
				HandlerCache.unHide = await import('./mutation.unHide.handler').then((mod) => mod.unHide)
			if (!HandlerCache.unHide) throw new Error('Failed to load handler')
			return HandlerCache.unHide({ ctx, input })
		}),
	delete: permissionedProcedure('deleteUserReview')
		.input(schema.ZDeleteSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.delete)
				HandlerCache.delete = await import('./mutation.delete.handler').then((mod) => mod.deleteReview)
			if (!HandlerCache.delete) throw new Error('Failed to load handler')
			return HandlerCache.delete({ ctx, input })
		}),
	unDelete: permissionedProcedure('undeleteUserReview')
		.input(schema.ZUnDeleteSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.unDelete)
				HandlerCache.unDelete = await import('./mutation.unDelete.handler').then((mod) => mod.unDelete)
			if (!HandlerCache.unDelete) throw new Error('Failed to load handler')
			return HandlerCache.unDelete({ ctx, input })
		}),
	getAverage: publicProcedure.input(schema.ZGetAverageSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getAverage)
			HandlerCache.getAverage = await import('./query.getAverage.handler').then((mod) => mod.getAverage)
		if (!HandlerCache.getAverage) throw new Error('Failed to load handler')
		return HandlerCache.getAverage({ ctx, input })
	}),
	getFeatured: publicProcedure.input(schema.ZGetFeaturedSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getFeatured)
			HandlerCache.getFeatured = await import('./query.getFeatured.handler').then((mod) => mod.getFeatured)
		if (!HandlerCache.getFeatured) throw new Error('Failed to load handler')
		return HandlerCache.getFeatured({ ctx, input })
	}),
})
