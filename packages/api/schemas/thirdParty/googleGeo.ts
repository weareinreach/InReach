import { PlaceType2, GeocodingAddressComponentType } from '@googlemaps/google-maps-services-js'
import { z } from 'zod'

export const autocompleteResponse = z
	.object({
		predictions: z
			.object({
				place_id: z.string(),
				structured_formatting: z.object({
					main_text: z.string(),
					secondary_text: z.string(),
				}),
			})
			.array(),
		status: z.enum([
			'OK',
			'ZERO_RESULTS',
			'INVALID_REQUEST',
			'OVER_QUERY_LIMIT',
			'REQUEST_DENIED',
			'UNKNOWN_ERROR',
		]),
		error_message: z.string().optional(),
		info_messages: z.string().array().optional(),
	})
	.transform(({ predictions, ...data }) => ({
		...data,
		results: predictions.map((result) => ({
			value: result.structured_formatting.main_text,
			subheading: result.structured_formatting.secondary_text,
			placeId: result.place_id,
		})),
	}))

const coordinates = z.object({
	lat: z.number(),
	lng: z.number(),
})

export const geocodeResponse = z
	.object({
		results: z
			.object({
				geometry: z.object({
					location: coordinates,
					bounds: z
						.object({
							northeast: coordinates,
							southwest: coordinates,
						})
						.optional(),
					viewport: z.object({
						northeast: coordinates,
						southwest: coordinates,
					}),
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
		status: z.enum([
			'OK',
			'ZERO_RESULTS',
			'INVALID_REQUEST',
			'OVER_QUERY_LIMIT',
			'REQUEST_DENIED',
			'UNKNOWN_ERROR',
		]),
		error_message: z.string().optional(),
		info_messages: z.string().array().optional(),
	})
	.transform(({ results, ...data }) => {
		const result = results[0]
		if (!result) return { result: undefined, ...data }

		const getAddressPart = (part: GeocodingAddressComponentType | PlaceType2) =>
			result.address_components.find(({ types }) => types.includes(part)) ?? {
				short_name: undefined,
				long_name: undefined,
				types: [],
			}

		const { short_name: streetNumber } = getAddressPart(GeocodingAddressComponentType.street_number)
		const { long_name: streetName } = getAddressPart(PlaceType2.route)
		const { long_name: city } = getAddressPart(PlaceType2.locality)
		const { short_name: govDist } = getAddressPart(PlaceType2.administrative_area_level_1)
		const { short_name: postCode } = getAddressPart(PlaceType2.postal_code)
		const { short_name: country } = getAddressPart(PlaceType2.country)

		return {
			result: {
				geometry: result.geometry,
				streetNumber,
				streetName,
				city,
				govDist,
				postCode,
				country,
			},
			...data,
		}
	})

export type AutocompleteResponse = z.infer<typeof autocompleteResponse>
export type GeocodeResponse = z.infer<typeof geocodeResponse>
export type GoogleAPIResponse = AutocompleteResponse | GeocodeResponse
