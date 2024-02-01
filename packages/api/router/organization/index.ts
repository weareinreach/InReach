import {
	defineRouter,
	importHandler,
	permissionedProcedure,
	protectedProcedure,
	publicProcedure,
} from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'organization'

const namespaced = (s: string) => `${NAMESPACE}.${s}`

export const orgRouter = defineRouter({
	//
	// QUERIES
	//
	// #region Queries
	getById: publicProcedure.input(schema.ZGetByIdSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('getById'), () => import('./query.getById.handler'))
		return handler(opts)
	}),
	getBySlug: publicProcedure.input(schema.ZGetBySlugSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('getBySlug'), () => import('./query.getBySlug.handler'))
		return handler(opts)
	}),
	getIdFromSlug: publicProcedure.input(schema.ZGetIdFromSlugSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('getIdFromSlug'),
			() => import('./query.getIdFromSlug.handler')
		)
		return handler(opts)
	}),
	searchName: publicProcedure.input(schema.ZSearchNameSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('searchName'), () => import('./query.searchName.handler'))
		return handler(opts)
	}),
	searchDistance: publicProcedure.input(schema.ZSearchDistanceSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('searchDistance'),
			() => import('./query.searchDistance.handler')
		)
		return handler(opts)
	}),
	getNameFromSlug: publicProcedure.input(schema.ZGetNameFromSlugSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('getNameFromSlug'),
			() => import('./query.getNameFromSlug.handler')
		)
		return handler(opts)
	}),
	isSaved: publicProcedure.input(schema.ZIsSavedSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('isSaved'), () => import('./query.isSaved.handler'))
		return handler(opts)
	}),
	suggestionOptions: publicProcedure.query(async () => {
		const handler = await importHandler(
			namespaced('suggestionOptions'),
			() => import('./query.suggestionOptions.handler')
		)
		return handler()
	}),
	checkForExisting: publicProcedure.input(schema.ZCheckForExistingSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('checkForExisting'),
			() => import('./query.checkForExisting.handler')
		)
		return handler(opts)
	}),
	generateSlug: protectedProcedure.input(schema.ZGenerateSlugSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('generateSlug'),
			() => import('./query.generateSlug.handler')
		)
		return handler(opts)
	}),
	forOrgPage: publicProcedure.input(schema.ZForOrgPageSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('forOrgPage'), () => import('./query.forOrgPage.handler'))
		return handler(opts)
	}),
	forLocationPage: publicProcedure.input(schema.ZForLocationPageSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('forLocationPage'),
			() => import('./query.forLocationPage.handler')
		)
		return handler(opts)
	}),
	slugRedirect: publicProcedure.input(schema.ZSlugRedirectSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('slugRedirect'),
			() => import('./query.slugRedirect.handler')
		)
		return handler(opts)
	}),
	getIntlCrisis: publicProcedure.input(schema.ZGetIntlCrisisSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('getIntlCrisis'),
			() => import('./query.getIntlCrisis.handler')
		)
		return handler(opts)
	}),
	getNatlCrisis: publicProcedure.input(schema.ZGetNatlCrisisSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('getNatlCrisis'),
			() => import('./query.getNatlCrisis.handler')
		)
		return handler(opts)
	}),
	forOrganizationTable: publicProcedure.input(schema.ZForOrganizationTableSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('forOrganizationTable'),
			() => import('./query.forOrganizationTable.handler')
		)
		return handler(opts)
	}),
	forOrgPageEdits: publicProcedure.input(schema.ZForOrgPageEditsSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('forOrgPageEdits'),
			() => import('./query.forOrgPageEdits.handler')
		)
		return handler(opts)
	}),
	getAttributes: publicProcedure.input(schema.ZGetAttributesSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('getAttributes'),
			() => import('./query.getAttributes.handler')
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
	createNewQuick: permissionedProcedure('createNewOrgQuick')
		.input(schema.ZCreateNewQuickSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('createNewQuick'),
				() => import('./mutation.createNewQuick.handler')
			)
			return handler(opts)
		}),
	createNewSuggestion: protectedProcedure.input(schema.ZCreateNewSuggestionSchema).mutation(async (opts) => {
		const handler = await importHandler(
			namespaced('createNewSuggestion'),
			() => import('./mutation.createNewSuggestion.handler')
		)
		return handler(opts)
	}),
	attachAttribute: permissionedProcedure('attachOrgAttributes')
		.input(schema.ZAttachAttributeSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('attachAttribute'),
				() => import('./mutation.attachAttribute.handler')
			)
			return handler(opts)
		}),
	updateBasic: permissionedProcedure('createNewOrgQuick')
		.input(schema.ZUpdateBasicSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('updateBasic'),
				() => import('./mutation.updateBasic.handler')
			)
			return handler(opts)
		}),
	// #endregion
})
