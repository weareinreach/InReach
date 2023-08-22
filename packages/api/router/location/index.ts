import { defineRouter, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

export const HandlerCache: Partial<LocationHandlerCache> = {}

export const locationRouter = defineRouter({
	//
	// QUERIES
	//
	// #region Queries

	getById: publicProcedure.input(schema.ZGetByIdSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getById) {
			HandlerCache.getById = await import('./query.getById.handler').then((mod) => mod.getById)
		}
		if (!HandlerCache.getById) throw new Error('Failed to load handler')
		return HandlerCache.getById({ ctx, input })
	}),
	getByOrgId: publicProcedure.input(schema.ZGetByOrgIdSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getByOrgId) {
			HandlerCache.getByOrgId = await import('./query.getByOrgId.handler').then((mod) => mod.getByOrgId)
		}
		if (!HandlerCache.getByOrgId) throw new Error('Failed to load handler')
		return HandlerCache.getByOrgId({ ctx, input })
	}),
	getNameById: publicProcedure.input(schema.ZGetNameByIdSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getNameById) {
			HandlerCache.getNameById = await import('./query.getNameById.handler').then((mod) => mod.getNameById)
		}
		if (!HandlerCache.getNameById) throw new Error('Failed to load handler')
		return HandlerCache.getNameById({ ctx, input })
	}),
	getNames: permissionedProcedure('getDetails')
		.input(schema.ZGetNamesSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.getNames) {
				HandlerCache.getNames = await import('./query.getNames.handler').then((mod) => mod.getNames)
			}
			if (!HandlerCache.getNames) throw new Error('Failed to load handler')
			return HandlerCache.getNames({ ctx, input })
		}),
	getAddress: permissionedProcedure('updateLocation')
		.input(schema.ZGetAddressSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.getAddress) {
				HandlerCache.getAddress = await import('./query.getAddress.handler').then((mod) => mod.getAddress)
			}
			if (!HandlerCache.getAddress) throw new Error('Failed to load handler')
			return HandlerCache.getAddress({ ctx, input })
		}),
	forLocationCard: publicProcedure.input(schema.ZForLocationCardSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.forLocationCard) {
			HandlerCache.forLocationCard = await import('./query.forLocationCard.handler').then(
				(mod) => mod.forLocationCard
			)
		}
		if (!HandlerCache.forLocationCard) throw new Error('Failed to load handler')
		return HandlerCache.forLocationCard({ ctx, input })
	}),
	forVisitCard: publicProcedure.input(schema.ZForVisitCardSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.forVisitCard) {
			HandlerCache.forVisitCard = await import('./query.forVisitCard.handler').then((mod) => mod.forVisitCard)
		}
		if (!HandlerCache.forVisitCard) throw new Error('Failed to load handler')
		return HandlerCache.forVisitCard({ ctx, input })
	}),
	forGoogleMaps: publicProcedure.input(schema.ZForGoogleMapsSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.forGoogleMaps) {
			HandlerCache.forGoogleMaps = await import('./query.forGoogleMaps.handler').then(
				(mod) => mod.forGoogleMaps
			)
		}
		if (!HandlerCache.forGoogleMaps) throw new Error('Failed to load handler')
		return HandlerCache.forGoogleMaps({ ctx, input })
	}),
	forLocationPage: publicProcedure.input(schema.ZForLocationPageSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.forLocationPage) {
			HandlerCache.forLocationPage = await import('./query.forLocationPage.handler').then(
				(mod) => mod.forLocationPage
			)
		}
		if (!HandlerCache.forLocationPage) throw new Error('Failed to load handler')
		return HandlerCache.forLocationPage({ ctx, input })
	}),
	// #endregion
	//
	// MUTATIONS
	//
	// #region Mutations
	create: permissionedProcedure('createNewLocation')
		.input(schema.ZCreateSchema().inputSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.create) {
				HandlerCache.create = await import('./mutation.create.handler').then((mod) => mod.create)
			}
			if (!HandlerCache.create) throw new Error('Failed to load handler')
			return HandlerCache.create({ ctx, input })
		}),
	update: permissionedProcedure('updateLocation')
		.input(schema.ZUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.update) {
				HandlerCache.update = await import('./mutation.update.handler').then((mod) => mod.update)
			}
			if (!HandlerCache.update) throw new Error('Failed to load handler')
			return HandlerCache.update({ ctx, input })
		}),
	// #endregion
})

type LocationHandlerCache = {
	//
	// QUERIES
	//
	// #region Queries
	getById: typeof import('./query.getById.handler').getById
	getByOrgId: typeof import('./query.getByOrgId.handler').getByOrgId
	getNameById: typeof import('./query.getNameById.handler').getNameById
	getNames: typeof import('./query.getNames.handler').getNames
	getAddress: typeof import('./query.getAddress.handler').getAddress
	forLocationCard: typeof import('./query.forLocationCard.handler').forLocationCard
	forVisitCard: typeof import('./query.forVisitCard.handler').forVisitCard
	forGoogleMaps: typeof import('./query.forGoogleMaps.handler').forGoogleMaps
	forLocationPage: typeof import('./query.forLocationPage.handler').forLocationPage
	// #endregion
	//
	// MUTATIONS
	//
	// #region Mutations
	create: typeof import('./mutation.create.handler').create
	update: typeof import('./mutation.update.handler').update
	// #endregion
}
