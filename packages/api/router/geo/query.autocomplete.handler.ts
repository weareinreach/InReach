/* eslint-disable node/no-process-env */
import {
	type PlaceAutocompleteRequest,
	type PlaceAutocompleteType,
} from '@googlemaps/google-maps-services-js'

import { googleMapsApi } from '~api/google'
import { handleError } from '~api/lib/errorHandler'
import { googleAPIResponseHandler } from '~api/lib/googleHandler'
import { autocompleteResponse } from '~api/schemas/thirdParty/googleGeo'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAutocompleteSchema } from './query.autocomplete.schema'

export const autocomplete = async ({ input }: TRPCHandlerParams<TAutocompleteSchema>) => {
	try {
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

		const { data } = await googleMapsApi.placeAutocomplete({
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
	} catch (error) {
		handleError(error)
	}
}
