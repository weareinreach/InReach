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
})

type HandlerCache = {
	getServiceArea: typeof import('./query.getServiceArea.handler').getServiceArea
}
