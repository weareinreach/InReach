import { defineRouter, permissionedProcedure, publicProcedure, staffProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const HandlerCache: Partial<OrgHoursHandlerCache> = {}
type OrgHoursHandlerCache = {
	create: typeof import('./mutation.create.handler').create
	update: typeof import('./mutation.update.handler').update
	createMany: typeof import('./mutation.createMany.handler').createMany
	getTz: typeof import('./query.getTz.handler').getTz
	forHoursDisplay: typeof import('./query.forHoursDisplay.handler').forHoursDisplay
	forHoursDrawer: typeof import('./query.forHoursDrawer.handler').forHoursDrawer
}

export const orgHoursRouter = defineRouter({
	create: permissionedProcedure('createNewHours')
		.input(schema.ZCreateSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.create)
				HandlerCache.create = await import('./mutation.create.handler').then((mod) => mod.create)
			if (!HandlerCache.create) throw new Error('Failed to load handler')
			return HandlerCache.create({ ctx, input })
		}),
	createMany: permissionedProcedure('createNewHours')
		.input(schema.ZCreateManySchema().inputSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.createMany)
				HandlerCache.createMany = await import('./mutation.createMany.handler').then((mod) => mod.createMany)
			if (!HandlerCache.createMany) throw new Error('Failed to load handler')
			return HandlerCache.createMany({ ctx, input })
		}),
	update: permissionedProcedure('updateHours')
		.input(schema.ZUpdateSchema)
		.mutation(async ({ input, ctx }) => {
			if (!HandlerCache.update)
				HandlerCache.update = await import('./mutation.update.handler').then((mod) => mod.update)
			if (!HandlerCache.update) throw new Error('Failed to load handler')
			return HandlerCache.update({ ctx, input })
		}),
	getTz: staffProcedure.input(schema.ZGetTzSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getTz)
			HandlerCache.getTz = await import('./query.getTz.handler').then((mod) => mod.getTz)
		if (!HandlerCache.getTz) throw new Error('Failed to load handler')
		return HandlerCache.getTz({ ctx, input })
	}),
	forHoursDisplay: publicProcedure.input(schema.ZForHoursDisplaySchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.forHoursDisplay)
			HandlerCache.forHoursDisplay = await import('./query.forHoursDisplay.handler').then(
				(mod) => mod.forHoursDisplay
			)
		if (!HandlerCache.forHoursDisplay) throw new Error('Failed to load handler')
		return HandlerCache.forHoursDisplay({ ctx, input })
	}),
	forHoursDrawer: publicProcedure
		// permissionedProcedure('updateHours')
		.input(schema.ZForHoursDrawerSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.forHoursDrawer)
				HandlerCache.forHoursDrawer = await import('./query.forHoursDrawer.handler').then(
					(mod) => mod.forHoursDrawer
				)
			if (!HandlerCache.forHoursDrawer) throw new Error('Failed to load handler')
			return HandlerCache.forHoursDrawer({ ctx, input })
		}),
})
