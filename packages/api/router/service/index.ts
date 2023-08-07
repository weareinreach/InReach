import { defineRouter, permissionedProcedure, protectedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const HandlerCache: Partial<ServiceHandlerCache> = {}
export const serviceRouter = defineRouter({
	//
	// QUERIES
	//
	// #region Queries
	byId: publicProcedure.input(schema.ZByIdSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.byId) {
			HandlerCache.byId = await import('./query.byId.handler').then((mod) => mod.byId)
		}
		if (!HandlerCache.byId) throw new Error('Failed to load handler')
		return HandlerCache.byId({ ctx, input })
	}),
	byOrgId: permissionedProcedure('updateOrgService')
		.input(schema.ZByOrgIdSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.byOrgId) {
				HandlerCache.byOrgId = await import('./query.byOrgId.handler').then((mod) => mod.byOrgId)
			}
			if (!HandlerCache.byOrgId) throw new Error('Failed to load handler')
			return HandlerCache.byOrgId({ ctx, input })
		}),
	byOrgLocationId: publicProcedure.input(schema.ZByOrgLocationIdSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.byOrgLocationId) {
			HandlerCache.byOrgLocationId = await import('./query.byOrgLocationId.handler').then(
				(mod) => mod.byOrgLocationId
			)
		}
		if (!HandlerCache.byOrgLocationId) throw new Error('Failed to load handler')
		return HandlerCache.byOrgLocationId({ ctx, input })
	}),
	byUserListId: protectedProcedure.input(schema.ZByUserListIdSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.byUserListId) {
			HandlerCache.byUserListId = await import('./query.byUserListId.handler').then((mod) => mod.byUserListId)
		}
		if (!HandlerCache.byUserListId) throw new Error('Failed to load handler')
		return HandlerCache.byUserListId({ ctx, input })
	}),
	getFilterOptions: publicProcedure.query(async () => {
		if (!HandlerCache.getFilterOptions) {
			HandlerCache.getFilterOptions = await import('./query.getFilterOptions.handler').then(
				(mod) => mod.getFilterOptions
			)
		}
		if (!HandlerCache.getFilterOptions) throw new Error('Failed to load handler')
		return HandlerCache.getFilterOptions()
	}),
	getParentName: publicProcedure.input(schema.ZGetParentNameSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getParentName) {
			HandlerCache.getParentName = await import('./query.getParentName.handler').then(
				(mod) => mod.getParentName
			)
		}
		if (!HandlerCache.getParentName) throw new Error('Failed to load handler')
		return HandlerCache.getParentName({ ctx, input })
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
	forServiceDrawer: permissionedProcedure('updateOrgService')
		.input(schema.ZForServiceDrawerSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.forServiceDrawer) {
				HandlerCache.forServiceDrawer = await import('./query.forServiceDrawer.handler').then(
					(mod) => mod.forServiceDrawer
				)
			}
			if (!HandlerCache.forServiceDrawer) throw new Error('Failed to load handler')
			return HandlerCache.forServiceDrawer({ ctx, input })
		}),
	forServiceEditDrawer: permissionedProcedure('updateOrgService')
		.input(schema.ZForServiceEditDrawerSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.forServiceEditDrawer) {
				HandlerCache.forServiceEditDrawer = await import('./query.forServiceEditDrawer.handler').then(
					(mod) => mod.forServiceEditDrawer
				)
			}
			if (!HandlerCache.forServiceEditDrawer) throw new Error('Failed to load handler')
			return HandlerCache.forServiceEditDrawer({ ctx, input })
		}),
	getOptions: permissionedProcedure('updateOrgService').query(async () => {
		if (!HandlerCache.getOptions) {
			HandlerCache.getOptions = await import('./query.getOptions.handler').then((mod) => mod.getOptions)
		}
		if (!HandlerCache.getOptions) throw new Error('Failed to load handler')
		return HandlerCache.getOptions()
	}),
	forServiceInfoCard: publicProcedure
		.input(schema.ZForServiceInfoCardSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.forServiceInfoCard) {
				HandlerCache.forServiceInfoCard = await import('./query.forServiceInfoCard.handler').then(
					(mod) => mod.forServiceInfoCard
				)
			}
			if (!HandlerCache.forServiceInfoCard) throw new Error('Failed to load handler')
			return HandlerCache.forServiceInfoCard({ ctx, input })
		}),
	forServiceModal: publicProcedure.input(schema.ZForServiceModalSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.forServiceModal) {
			HandlerCache.forServiceModal = await import('./query.forServiceModal.handler').then(
				(mod) => mod.forServiceModal
			)
		}
		if (!HandlerCache.forServiceModal) throw new Error('Failed to load handler')
		return HandlerCache.forServiceModal({ ctx, input })
	}),
	// #endregion
	//
	// MUTATIONS
	//
	// #region Mutations

	create: permissionedProcedure('createOrgService')
		.input(schema.ZCreateSchema().inputSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.create) {
				HandlerCache.create = await import('./mutation.create.handler').then((mod) => mod.create)
			}
			if (!HandlerCache.create) throw new Error('Failed to load handler')
			return HandlerCache.create({ ctx, input })
		}),
	update: permissionedProcedure('updateOrgService')
		.input(schema.ZUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.update) {
				HandlerCache.update = await import('./mutation.update.handler').then((mod) => mod.update)
			}
			if (!HandlerCache.update) throw new Error('Failed to load handler')
			return HandlerCache.update({ ctx, input })
		}),
	attachServiceAttribute: permissionedProcedure('attachServiceAttribute')
		.input(schema.ZAttachServiceAttributeSchema().inputSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.attachServiceAttribute) {
				HandlerCache.attachServiceAttribute = await import('./mutation.attachServiceAttribute.handler').then(
					(mod) => mod.attachServiceAttribute
				)
			}
			if (!HandlerCache.attachServiceAttribute) throw new Error('Failed to load handler')
			return HandlerCache.attachServiceAttribute({ ctx, input })
		}),
	attachServiceTags: permissionedProcedure('attachServiceTags')
		.input(schema.ZAttachServiceTagsSchema().inputSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.attachServiceTags) {
				HandlerCache.attachServiceTags = await import('./mutation.attachServiceTags.handler').then(
					(mod) => mod.attachServiceTags
				)
			}
			if (!HandlerCache.attachServiceTags) throw new Error('Failed to load handler')
			return HandlerCache.attachServiceTags({ ctx, input })
		}),
	createServiceArea: permissionedProcedure('createServiceArea')
		.input(schema.ZCreateServiceAreaSchema().inputSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.createServiceArea) {
				HandlerCache.createServiceArea = await import('./mutation.createServiceArea.handler').then(
					(mod) => mod.createServiceArea
				)
			}
			if (!HandlerCache.createServiceArea) throw new Error('Failed to load handler')
			return HandlerCache.createServiceArea({ ctx, input })
		}),
	linkEmails: permissionedProcedure('linkServiceEmail')
		.input(schema.ZLinkEmailsSchema().inputSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.linkEmails) {
				HandlerCache.linkEmails = await import('./mutation.linkEmails.handler').then((mod) => mod.linkEmails)
			}
			if (!HandlerCache.linkEmails) throw new Error('Failed to load handler')
			return HandlerCache.linkEmails({ ctx, input })
		}),
	linkPhones: permissionedProcedure('linkServicePhone')
		.input(schema.ZLinkPhonesSchema().inputSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.linkPhones) {
				HandlerCache.linkPhones = await import('./mutation.linkPhones.handler').then((mod) => mod.linkPhones)
			}
			if (!HandlerCache.linkPhones) throw new Error('Failed to load handler')
			return HandlerCache.linkPhones({ ctx, input })
		}),
	createAccessInstructions: permissionedProcedure('createAccessInstructions')
		.input(schema.ZCreateAccessInstructionsSchema().inputSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.createAccessInstructions) {
				HandlerCache.createAccessInstructions = await import(
					'./mutation.createAccessInstructions.handler'
				).then((mod) => mod.createAccessInstructions)
			}
			if (!HandlerCache.createAccessInstructions) throw new Error('Failed to load handler')
			return HandlerCache.createAccessInstructions({ ctx, input })
		}),
	// #endregion
})

type ServiceHandlerCache = {
	//
	// QUERIES
	//
	// #region Queries
	byId: typeof import('./query.byId.handler').byId
	byOrgId: typeof import('./query.byOrgId.handler').byOrgId
	byOrgLocationId: typeof import('./query.byOrgLocationId.handler').byOrgLocationId
	byUserListId: typeof import('./query.byUserListId.handler').byUserListId
	getFilterOptions: typeof import('./query.getFilterOptions.handler').getFilterOptions
	getParentName: typeof import('./query.getParentName.handler').getParentName
	getNames: typeof import('./query.getNames.handler').getNames
	forServiceDrawer: typeof import('./query.forServiceDrawer.handler').forServiceDrawer
	forServiceEditDrawer: typeof import('./query.forServiceEditDrawer.handler').forServiceEditDrawer
	getOptions: typeof import('./query.getOptions.handler').getOptions
	forServiceInfoCard: typeof import('./query.forServiceInfoCard.handler').forServiceInfoCard
	forServiceModal: typeof import('./query.forServiceModal.handler').forServiceModal
	// #endregion
	//
	// MUTATIONS
	//
	// #region Mutations
	create: typeof import('./mutation.create.handler').create
	update: typeof import('./mutation.update.handler').update
	attachServiceAttribute: typeof import('./mutation.attachServiceAttribute.handler').attachServiceAttribute
	attachServiceTags: typeof import('./mutation.attachServiceTags.handler').attachServiceTags
	createServiceArea: typeof import('./mutation.createServiceArea.handler').createServiceArea
	linkEmails: typeof import('./mutation.linkEmails.handler').linkEmails
	linkPhones: typeof import('./mutation.linkPhones.handler').linkPhones
	createAccessInstructions: typeof import('./mutation.createAccessInstructions.handler').createAccessInstructions
	// #endregion
}
