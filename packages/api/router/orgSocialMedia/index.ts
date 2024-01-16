import { defineRouter, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const HandlerCache: Partial<OrgSocialMediaHandlerCache> = {}
type OrgSocialMediaHandlerCache = {
	create: typeof import('./mutation.create.handler').create
	update: typeof import('./mutation.update.handler').update
	forContactInfo: typeof import('./query.forContactInfo.handler').forContactInfo
	forContactInfoEdits: typeof import('./query.forContactInfoEdits.handler').forContactInfoEdits
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
})
