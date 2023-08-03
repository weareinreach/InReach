import { defineRouter, publicProcedure, staffProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

type AttributeQueryHandlerCache = {
	getFilterOptions: typeof import('./query.getFilterOptions.handler').getFilterOptions
	getOne: typeof import('./query.getOne.handler').getOne
}

const HandlerCache: Partial<AttributeQueryHandlerCache> = {}
export const attributeRouter = defineRouter({
	getFilterOptions: publicProcedure.query(async ({ ctx }) => {
		if (!HandlerCache.getFilterOptions)
			HandlerCache.getFilterOptions = await import('./query.getFilterOptions.handler').then(
				(mod) => mod.getFilterOptions
			)

		if (!HandlerCache.getFilterOptions) throw new Error('Failed to load handler')
		return HandlerCache.getFilterOptions({ ctx })
	}),
	getOne: staffProcedure.input(schema.ZGetOneSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.getOne)
			HandlerCache.getOne = await import('./query.getOne.handler').then((mod) => mod.getOne)

		if (!HandlerCache.getOne) throw new Error('Failed to load handler')
		return HandlerCache.getOne({ ctx, input })
	}),
})
