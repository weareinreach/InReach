import { defineRouter, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

export const HandlerCache: Partial<HandlerCache> = {}
export const serviceAreaRouter = defineRouter({
	getServiceArea: publicProcedure.input(schema.ZGetServiceAreaSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getServiceArea) {
			HandlerCache.getServiceArea = await import('./query.getServiceArea.handler').then(
				(mod) => mod.getServiceArea
			)
		}
		if (!HandlerCache.getServiceArea) throw new Error('Failed to load handler')
		return HandlerCache.getServiceArea({ ctx, input })
	}),
	update: publicProcedure.input(schema.ZUpdateSchema).mutation(async ({ ctx, input }) => {
		if (!HandlerCache.update) {
			HandlerCache.update = await import('./mutation.update.handler').then((mod) => mod.update)
		}
		if (!HandlerCache.update) throw new Error('Failed to load handler')
		return HandlerCache.update({ ctx, input })
	}),
})

type HandlerCache = {
	getServiceArea: typeof import('./query.getServiceArea.handler').getServiceArea
	update: typeof import('./mutation.update.handler').update
}
