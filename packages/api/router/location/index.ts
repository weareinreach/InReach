import { defineRouter, importHandler, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'location'

const namespaced = (s: string) => `${NAMESPACE}.${s}`

export const locationRouter = defineRouter({
	//
	// QUERIES
	//
	// #region Queries

	getById: publicProcedure.input(schema.ZGetByIdSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('getById'), () => import('./query.getById.handler'))
		return handler(opts)
	}),
	getByOrgId: publicProcedure.input(schema.ZGetByOrgIdSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('getByOrgId'), () => import('./query.getByOrgId.handler'))
		return handler(opts)
	}),
	getNameById: publicProcedure.input(schema.ZGetNameByIdSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('getNameById'),
			() => import('./query.getNameById.handler')
		)
		return handler(opts)
	}),
	getNames: permissionedProcedure('getDetails')
		.input(schema.ZGetNamesSchema)
		.query(async (opts) => {
			const handler = await importHandler(namespaced('getNames'), () => import('./query.getNames.handler'))
			return handler(opts)
		}),
	getAddress: permissionedProcedure('updateLocation')
		.input(schema.ZGetAddressSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('getAddress'),
				() => import('./query.getAddress.handler')
			)
			return handler(opts)
		}),
	forLocationCard: publicProcedure.input(schema.ZForLocationCardSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('forLocationCard'),
			() => import('./query.forLocationCard.handler')
		)
		return handler(opts)
	}),
	forVisitCard: publicProcedure.input(schema.ZForVisitCardSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('forVisitCard'),
			() => import('./query.forVisitCard.handler')
		)
		return handler(opts)
	}),
	forGoogleMaps: publicProcedure.input(schema.ZForGoogleMapsSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('forGoogleMaps'),
			() => import('./query.forGoogleMaps.handler')
		)
		return handler(opts)
	}),
	forLocationPage: publicProcedure.input(schema.ZForLocationPageSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('forLocationPage'),
			() => import('./query.forLocationPage.handler')
		)
		return handler(opts)
	}),
	getAlerts: publicProcedure.input(schema.ZGetAlertsSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('getAlerts'), () => import('./query.getAlerts.handler'))
		return handler(opts)
	}),
	// #endregion
	//
	// MUTATIONS
	//
	// #region Mutations
	create: permissionedProcedure('createNewLocation')
		.input(schema.ZCreateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('create'), () => import('./mutation.create.handler'))
			return handler(opts)
		}),
	update: permissionedProcedure('updateLocation')
		.input(schema.ZUpdateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('update'), () => import('./mutation.update.handler'))
			return handler(opts)
		}),
	// #endregion
})
