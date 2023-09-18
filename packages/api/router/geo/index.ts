import { defineRouter, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const HandlerCache: Partial<GeoHandlerCache> = {}

type GeoHandlerCache = {
	autocomplete: typeof import('./query.autocomplete.handler').autocomplete
	geoByPlaceId: typeof import('./query.geoByPlaceId.handler').geoByPlaceId
}

export const geoRouter = defineRouter({
	autocomplete: publicProcedure.input(schema.ZAutocompleteSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.autocomplete)
			HandlerCache.autocomplete = await import('./query.autocomplete.handler').then((mod) => mod.autocomplete)
		if (!HandlerCache.autocomplete) throw new Error('Failed to load handler')
		return HandlerCache.autocomplete({ ctx, input })
	}),
	geoByPlaceId: publicProcedure.input(schema.ZGeoByPlaceIdSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.geoByPlaceId)
			HandlerCache.geoByPlaceId = await import('./query.geoByPlaceId.handler').then((mod) => mod.geoByPlaceId)
		if (!HandlerCache.geoByPlaceId) throw new Error('Failed to load handler')
		return HandlerCache.geoByPlaceId({ ctx, input })
	}),
})
