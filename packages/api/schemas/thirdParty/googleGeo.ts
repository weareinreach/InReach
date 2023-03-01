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
	.transform(({ results, ...data }) => ({
		result: results[0],
		...data,
	}))

export type AutocompleteResponse = z.infer<typeof autocompleteResponse>
export type GeocodeResponse = z.infer<typeof geocodeResponse>
export type GoogleAPIResponse = AutocompleteResponse | GeocodeResponse
