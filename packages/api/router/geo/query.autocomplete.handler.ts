/* eslint-disable node/no-process-env */
import { type PlaceAutocompleteRequest, PlaceAutocompleteType } from '@googlemaps/google-maps-services-js'

import { googleMapsApi } from '~api/google'
import { googleAPIResponseHandler } from '~api/lib/googleHandler'
import { autocompleteResponse } from '~api/schemas/thirdParty/googleGeo'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAutocompleteSchema } from './query.autocomplete.schema'

const getTypes = (input: TAutocompleteSchema): PlaceAutocompleteType => {
	if (input.cityOnly) {
		return [PlaceAutocompleteType.cities] as unknown as PlaceAutocompleteType
	}
	if (input.fullAddress) {
		return [PlaceAutocompleteType.address] as unknown as PlaceAutocompleteType
	}
	return [
		'administrative_area_level_2',
		'administrative_area_level_3',
		'neighborhood',
		'locality',
		'postal_code',
	] as unknown as PlaceAutocompleteType
}

const autocomplete = async ({ input }: TRPCHandlerParams<TAutocompleteSchema>) => {
	const types = getTypes(input)

	const { data } = await googleMapsApi.placeAutocomplete({
		params: {
			key: process.env.GOOGLE_PLACES_API_KEY as string,
			input: input.search,
			language: input.locale,
			locationbias: 'ipbias',
			types,
		},
	} as PlaceAutocompleteRequest)
	const parsedData = autocompleteResponse.parse(data)
	return googleAPIResponseHandler(parsedData, data)
}
export default autocomplete
