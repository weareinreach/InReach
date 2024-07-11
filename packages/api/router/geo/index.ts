import { defineRouter, importHandler, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'geo'

const namespaced = (s: string) => `${NAMESPACE}.${s}`

export const geoRouter = defineRouter({
	autocomplete: publicProcedure.input(schema.ZAutocompleteSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('autocomplete'),
			() => import('./query.autocomplete.handler')
		)
		return handler(opts)
	}),
	geoByPlaceId: publicProcedure.input(schema.ZGeoByPlaceIdSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('geoByPlaceId'),
			() => import('./query.geoByPlaceId.handler')
		)
		return handler(opts)
	}),
	cityCoords: publicProcedure.input(schema.ZCityCoordsSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('cityCoords'), () => import('./query.cityCoords.handler'))
		return handler(opts)
	}),
})
