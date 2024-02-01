import {
	defineRouter,
	importHandler,
	permissionedProcedure,
	protectedProcedure,
	publicProcedure,
} from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'review'

const namespaced = (s: string) => `${NAMESPACE}.${s}`

export const reviewRouter = defineRouter({
	create: protectedProcedure.input(schema.ZCreateSchema).mutation(async (opts) => {
		const handler = await importHandler(namespaced('create'), () => import('./mutation.create.handler'))
		return handler(opts)
	}),
	getCurrentUser: protectedProcedure.query(async (opts) => {
		const handler = await importHandler(
			namespaced('getCurrentUser'),
			() => import('./query.getCurrentUser.handler')
		)
		return handler(opts)
	}),
	getByOrg: publicProcedure.input(schema.ZGetByOrgSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('getByOrg'), () => import('./query.getByOrg.handler'))
		return handler(opts)
	}),
	getByLocation: publicProcedure.input(schema.ZGetByLocationSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('getByLocation'),
			() => import('./query.getByLocation.handler')
		)
		return handler(opts)
	}),
	getByService: publicProcedure.input(schema.ZGetByServiceSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('getByService'),
			() => import('./query.getByService.handler')
		)
		return handler(opts)
	}),
	/** Returns user reviews ready for public display. Takes reviewer's privacy preferences in to account */
	getByIds: publicProcedure.input(schema.ZGetByIdsSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('getByIds'), () => import('./query.getByIds.handler'))
		return handler(opts)
	}),
	getByUser: permissionedProcedure('viewUserReviews')
		.input(schema.ZGetByUserSchema)
		.query(async (opts) => {
			const handler = await importHandler(namespaced('getByUser'), () => import('./query.getByUser.handler'))
			return handler(opts)
		}),
	hide: permissionedProcedure('hideUserReview')
		.input(schema.ZHideSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('hide'), () => import('./mutation.hide.handler'))
			return handler(opts)
		}),
	unHide: permissionedProcedure('unHideUserReview')
		.input(schema.ZUnHideSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('unHide'), () => import('./mutation.unHide.handler'))
			return handler(opts)
		}),
	delete: permissionedProcedure('deleteUserReview')
		.input(schema.ZDeleteSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('delete'), () => import('./mutation.delete.handler'))
			return handler(opts)
		}),
	unDelete: permissionedProcedure('undeleteUserReview')
		.input(schema.ZUnDeleteSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('unDelete'), () => import('./mutation.unDelete.handler'))
			return handler(opts)
		}),
	getAverage: publicProcedure.input(schema.ZGetAverageSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('getAverage'), () => import('./query.getAverage.handler'))
		return handler(opts)
	}),
	getFeatured: publicProcedure.input(schema.ZGetFeaturedSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('getFeatured'),
			() => import('./query.getFeatured.handler')
		)
		return handler(opts)
	}),
})
