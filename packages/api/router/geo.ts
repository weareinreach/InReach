/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { Client, PlaceAutocompleteType, PlaceAutocompleteRequest } from '@googlemaps/google-maps-services-js'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { googleAPIResponseHandler } from '~api/lib/googleHandler'
import { defineRouter, publicProcedure } from '~api/lib/trpc'
import { autocompleteResponse, geocodeResponse } from '~api/schemas/thirdParty/googleGeo'

const google = new Client()

export const geoRouter = defineRouter({
	autocomplete: publicProcedure
		.input(z.object({ search: z.string(), locale: z.string().optional() }))
		.query(async ({ input }) => {
			const { data } = await google.placeAutocomplete({
				params: {
					key: process.env.GOOGLE_PLACES_API_KEY as string,
					input: input.search,
					language: input.locale,
					types: [
						'administrative_area_level_2',
						'administrative_area_level_3',
						'neighborhood',
						'locality',
						'colloquial_area',
					] as unknown as PlaceAutocompleteType,
					locationbias: 'ipbias',
				},
			} as PlaceAutocompleteRequest)
			const parsedData = autocompleteResponse.parse(data)
			return googleAPIResponseHandler(parsedData, data)
		}),
	geoByPlaceId: publicProcedure.input(z.string()).query(async ({ input }) => {
		const { data } = await google.geocode({
			params: {
				key: process.env.GOOGLE_PLACES_API_KEY as string,
				place_id: input,
			},
		})
		const parsedData = geocodeResponse.parse(data)
		return googleAPIResponseHandler(parsedData, data)
	}),
})
