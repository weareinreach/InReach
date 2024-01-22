import { defineRouter, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const HandlerCache: Partial<OrgSocialMediaHandlerCache> = {}
type OrgSocialMediaHandlerCache = {
	create: typeof import('./mutation.create.handler').create
	update: typeof import('./mutation.update.handler').update
	forContactInfo: typeof import('./query.forContactInfo.handler').forContactInfo
	forContactInfoEdits: typeof import('./query.forContactInfoEdits.handler').forContactInfoEdits
	getServiceTypes: typeof import('./query.getServiceTypes.handler').getServiceTypes
	forEditDrawer: typeof import('./query.forEditDrawer.handler').forEditDrawer
}
export const orgSocialMediaRouter = defineRouter({
	create: permissionedProcedure('createNewSocial')
		.input(schema.ZCreateSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.create)
				HandlerCache.create = await import('./mutation.create.handler').then((mod) => mod.create)
			if (!HandlerCache.create) throw new Error('Failed to load handler')
			return HandlerCache.create({ ctx, input })
		}),
	update: permissionedProcedure('updateSocialMedia')
		.input(schema.ZUpdateSchema)
		.mutation(async ({ input, ctx }) => {
			if (!HandlerCache.update)
				HandlerCache.update = await import('./mutation.update.handler').then((mod) => mod.update)
			if (!HandlerCache.update) throw new Error('Failed to load handler')
			return HandlerCache.update({ ctx, input })
		}),
	forContactInfo: publicProcedure.input(schema.ZForContactInfoSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.forContactInfo)
			HandlerCache.forContactInfo = await import('./query.forContactInfo.handler').then(
				(mod) => mod.forContactInfo
			)
		if (!HandlerCache.forContactInfo) throw new Error('Failed to load handler')
		return HandlerCache.forContactInfo({ ctx, input })
	}),
	forContactInfoEdits: permissionedProcedure('updateSocialMedia')
		.input(schema.ZForContactInfoEditsSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.forContactInfoEdits)
				HandlerCache.forContactInfoEdits = await import('./query.forContactInfoEdits.handler').then(
					(mod) => mod.forContactInfoEdits
				)
			if (!HandlerCache.forContactInfoEdits) throw new Error('Failed to load handler')
			return HandlerCache.forContactInfoEdits({ ctx, input })
		}),
	getServiceTypes: permissionedProcedure('updateSocialMedia')
		.input(schema.ZGetServiceTypesSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.getServiceTypes)
				HandlerCache.getServiceTypes = await import('./query.getServiceTypes.handler').then(
					(mod) => mod.getServiceTypes
				)
			if (!HandlerCache.getServiceTypes) throw new Error('Failed to load handler')
			return HandlerCache.getServiceTypes({ ctx, input })
		}),
	forEditDrawer: permissionedProcedure('updateSocialMedia')
		.input(schema.ZForEditDrawerSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.forEditDrawer)
				HandlerCache.forEditDrawer = await import('./query.forEditDrawer.handler').then(
					(mod) => mod.forEditDrawer
				)
			if (!HandlerCache.forEditDrawer) throw new Error('Failed to load handler')
			return HandlerCache.forEditDrawer({ ctx, input })
		}),
})
