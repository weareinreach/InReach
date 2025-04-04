import { GeocodingAddressComponentType, PlaceType2 } from '@googlemaps/google-maps-services-js'
import compact from 'just-compact'
import { z } from 'zod'

const responseStatus = z.enum([
	'OK',
	'ZERO_RESULTS',
	'INVALID_REQUEST',
	'OVER_QUERY_LIMIT',
	'REQUEST_DENIED',
	'UNKNOWN_ERROR',
])

const GoogleResponse = z.object({
	status: responseStatus,
	error_message: z.string().optional(),
	info_messages: z.string().array().optional(),
})

export const autocompleteResponse = GoogleResponse.extend({
	predictions: z
		.object({
			place_id: z.string(),
			structured_formatting: z.object({
				main_text: z.string(),
				secondary_text: z.string(),
			}),
		})
		.array(),
}).transform(({ predictions, ...data }) => ({
	...data,
	results: predictions.map((result) => ({
		value: `${result.structured_formatting.main_text}, ${result.structured_formatting.secondary_text}`,
		label: result.structured_formatting.main_text,
		subheading: result.structured_formatting.secondary_text,
		placeId: result.place_id,
	})),
}))

const coordinates = z.object({
	lat: z.number(),
	lng: z.number(),
})
const BoundsSchema = z.object({
	northeast: coordinates,
	southwest: coordinates,
})

type AddressPart = GeocodingAddressComponentType | PlaceType2
export const geocodeByPlaceIdResponse = GoogleResponse.extend({
	results: z
		.object({
			geometry: z.object({
				location: coordinates,
				bounds: BoundsSchema.optional(),
				viewport: BoundsSchema,
			}),
			address_components: z
				.object({
					long_name: z.string(),
					short_name: z.string(),
					types: z.union([z.nativeEnum(GeocodingAddressComponentType), z.nativeEnum(PlaceType2)]).array(),
				})
				.array(),
		})
		.array(),
}).transform(({ results, ...data }) => {
	const result = results[0]
	if (!result) {
		return { result: undefined, ...data }
	}

	const getAddressPart = (part: AddressPart | AddressPart[]) => {
		if (Array.isArray(part)) {
			return (
				result.address_components.find(({ types }) => part.some((val) => types.includes(val))) ?? {
					short_name: undefined,
					long_name: undefined,
					types: [],
				}
			)
		}
		return (
			result.address_components.find(({ types }) => types.includes(part)) ?? {
				short_name: undefined,
				long_name: undefined,
				types: [],
			}
		)
	}

	const { short_name: streetNumber } = getAddressPart(GeocodingAddressComponentType.street_number)
	const { long_name: streetName } = getAddressPart(PlaceType2.route)
	const { long_name: city } = getAddressPart([PlaceType2.locality, PlaceType2.postal_town])
	const { short_name: govDist } = getAddressPart(PlaceType2.administrative_area_level_1)
	const { short_name: postCode } = getAddressPart(PlaceType2.postal_code)
	const { short_name: country } = getAddressPart(PlaceType2.country)

	//second line of an address
	const { long_name: premise } = getAddressPart(PlaceType2.premise)
	const { long_name: subpremise } = getAddressPart(PlaceType2.subpremise)
	const street2 = compact([subpremise, premise]).length
		? compact([subpremise, premise]).join(', ')
		: undefined

	return {
		result: {
			geometry: result.geometry,
			streetNumber,
			streetName,
			street2,
			city,
			govDist,
			postCode,
			country,
		},
		...data,
	}
})

export const geocodeByStringResponse = GoogleResponse.extend({
	results: z
		.object({
			address_components: z
				.object({
					long_name: z.string(),
					short_name: z.string(),
					types: z.array(z.string()),
				})
				.array(),
			formatted_address: z.string(),
			geometry: z.object({
				bounds: BoundsSchema,
				location: coordinates,
				location_type: z.string(),
				viewport: BoundsSchema,
			}),
			place_id: z.string(),
			types: z.array(z.string()),
		})
		.array(),
}).transform(({ results, ...rest }) => ({
	...rest,
	results: results.length === 1 ? results.at(0) : results,
}))

export type AutocompleteResponse = z.infer<typeof autocompleteResponse>
export type GeocodeByPlaceIdResponse = z.infer<typeof geocodeByPlaceIdResponse>
export type GeocodeByStringResponse = z.infer<typeof geocodeByStringResponse>
export type GoogleAPIResponse = AutocompleteResponse | GeocodeByPlaceIdResponse | GeocodeByStringResponse
