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
		.input(
			z.object({
				search: z.string(),
				locale: z.string().optional(),
				cityOnly: z.boolean().default(false).optional(),
				fullAddress: z.boolean().default(false).optional(),
			})
		)
		.query(async ({ input }) => {
			const types = input.cityOnly
				? ['(cities)']
				: input.fullAddress
				? ['address']
				: ([
						'administrative_area_level_2',
						'administrative_area_level_3',
						'neighborhood',
						'locality',
						'postal_code',
				  ] as unknown as PlaceAutocompleteType)

			const { data } = await google.placeAutocomplete({
				params: {
					key: process.env.GOOGLE_PLACES_API_KEY as string,
					input: input.search,
					language: input.locale,
					types,
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
