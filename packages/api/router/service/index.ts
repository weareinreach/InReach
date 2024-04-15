import {
	defineRouter,
	importHandler,
	permissionedProcedure,
	protectedProcedure,
	publicProcedure,
} from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'service'

const namespaced = (s: string) => `${NAMESPACE}.${s}`
export const serviceRouter = defineRouter({
	//
	// QUERIES
	//
	// #region Queries
	byId: publicProcedure.input(schema.ZByIdSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('byId'), () => import('./query.byId.handler'))
		return handler(opts)
	}),
	byOrgId: permissionedProcedure('updateOrgService')
		.input(schema.ZByOrgIdSchema)
		.query(async (opts) => {
			const handler = await importHandler(namespaced('byOrgId'), () => import('./query.byOrgId.handler'))
			return handler(opts)
		}),
	byOrgLocationId: publicProcedure.input(schema.ZByOrgLocationIdSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('byOrgLocationId'),
			() => import('./query.byOrgLocationId.handler')
		)
		return handler(opts)
	}),
	byUserListId: protectedProcedure.input(schema.ZByUserListIdSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('byUserListId'),
			() => import('./query.byUserListId.handler')
		)
		return handler(opts)
	}),
	getFilterOptions: publicProcedure.query(async () => {
		const handler = await importHandler(
			namespaced('getFilterOptions'),
			() => import('./query.getFilterOptions.handler')
		)
		return handler()
	}),
	getParentName: publicProcedure.input(schema.ZGetParentNameSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('getParentName'),
			() => import('./query.getParentName.handler')
		)
		return handler(opts)
	}),
	getNames: permissionedProcedure('getDetails')
		.input(schema.ZGetNamesSchema)
		.query(async (opts) => {
			const handler = await importHandler(namespaced('getNames'), () => import('./query.getNames.handler'))
			return handler(opts)
		}),
	forServiceDrawer: permissionedProcedure('updateOrgService')
		.input(schema.ZForServiceDrawerSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('forServiceDrawer'),
				() => import('./query.forServiceDrawer.handler')
			)
			return handler(opts)
		}),
	forServiceEditDrawer: permissionedProcedure('updateOrgService')
		.input(schema.ZForServiceEditDrawerSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('forServiceEditDrawer'),
				() => import('./query.forServiceEditDrawer.handler')
			)
			return handler(opts)
		}),
	getOptions: permissionedProcedure('updateOrgService').query(async () => {
		const handler = await importHandler(namespaced('getOptions'), () => import('./query.getOptions.handler'))
		return handler()
	}),
	forServiceInfoCard: publicProcedure.input(schema.ZForServiceInfoCardSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('forServiceInfoCard'),
			() => import('./query.forServiceInfoCard.handler')
		)
		return handler(opts)
	}),
	forServiceModal: publicProcedure.input(schema.ZForServiceModalSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('forServiceModal'),
			() => import('./query.forServiceModal.handler')
		)
		return handler(opts)
	}),
	// #endregion
	//
	// MUTATIONS
	//
	// #region Mutations

	create: permissionedProcedure('createOrgService')
		.input(schema.ZCreateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('create'), () => import('./mutation.create.handler'))
			return handler(opts)
		}),
	update: permissionedProcedure('updateOrgService')
		.input(schema.ZUpdateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('update'), () => import('./mutation.update.handler'))
			return handler(opts)
		}),
	attachServiceAttribute: permissionedProcedure('attachServiceAttribute')
		.input(schema.ZAttachServiceAttributeSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('attachServiceAttribute'),
				() => import('./mutation.attachServiceAttribute.handler')
			)
			return handler(opts)
		}),
	attachServiceTags: permissionedProcedure('attachServiceTags')
		.input(schema.ZAttachServiceTagsSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('attachServiceTags'),
				() => import('./mutation.attachServiceTags.handler')
			)
			return handler(opts)
		}),
	createServiceArea: permissionedProcedure('createServiceArea')
		.input(schema.ZCreateServiceAreaSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('createServiceArea'),
				() => import('./mutation.createServiceArea.handler')
			)
			return handler(opts)
		}),
	linkEmails: permissionedProcedure('linkServiceEmail')
		.input(schema.ZLinkEmailsSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('linkEmails'),
				() => import('./mutation.linkEmails.handler')
			)
			return handler(opts)
		}),
	linkPhones: permissionedProcedure('linkServicePhone')
		.input(schema.ZLinkPhonesSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('linkPhones'),
				() => import('./mutation.linkPhones.handler')
			)
			return handler(opts)
		}),
	createAccessInstructions: permissionedProcedure('createAccessInstructions')
		.input(schema.ZCreateAccessInstructionsSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('createAccessInstructions'),
				() => import('./mutation.createAccessInstructions.handler')
			)
			return handler(opts)
		}),
	upsert: permissionedProcedure('updateOrgService')
		.input(schema.ZUpsertSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('upsert'), () => import('./mutation.upsert.handler'))
			return handler(opts)
		}),
	// #endregion
})
