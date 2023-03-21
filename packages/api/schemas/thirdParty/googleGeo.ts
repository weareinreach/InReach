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

const addressParts = ['locality', 'administrative_area_level_1', 'country'] as const

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
						types: z.string().array(),
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
		const cityResult = result?.address_components.find(({ types }) => types.includes('locality'))
		const govDistResult = result?.address_components.find(({ types }) =>
			types.includes('administrative_area_level_1')
		)
		const countryResult = result?.address_components.find(({ types }) => types.includes('country'))

		const { long_name: city } = cityResult ?? { long_name: undefined }
		const { short_name: govDist } = govDistResult ?? { short_name: undefined }
		const { short_name: country } = countryResult ?? { short_name: undefined }
		return {
			result: {
				geometry: result.geometry,
				city,
				govDist,
				country,
			},
			...data,
		}
	})

export type AutocompleteResponse = z.infer<typeof autocompleteResponse>
export type GeocodeResponse = z.infer<typeof geocodeResponse>
export type GoogleAPIResponse = AutocompleteResponse | GeocodeResponse
