import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~api/google', () => ({
	googleMapsApi: { geocode: vi.fn() },
}))

const { googleMapsApi } = await import('~api/google')
const { default: geoByPlaceId } = await import('./query.geoByPlaceId.handler')

const geocodeMock = vi.mocked(googleMapsApi.geocode)

beforeEach(() => {
	geocodeMock.mockReset()
})

describe('geo.geoByPlaceId', () => {
	it('4.5: resolves a valid place_id to the lat/lng Google returns', async () => {
		geocodeMock.mockResolvedValueOnce({
			data: {
				status: 'OK',
				results: [
					{
						geometry: {
							location: { lat: 40.7128, lng: -74.006 },
							viewport: {
								northeast: { lat: 40.72, lng: -74.0 },
								southwest: { lat: 40.7, lng: -74.02 },
							},
						},
						address_components: [],
					},
				],
			},
		} as never)

		const result = await geoByPlaceId({ input: 'place_id_123' } as never)

		expect(result.result?.geometry.location).toEqual({ lat: 40.7128, lng: -74.006 })
	})

	it('4.5b: an empty results array (place_id not found) resolves with `result: undefined`, not a thrown error', async () => {
		geocodeMock.mockResolvedValueOnce({ data: { status: 'OK', results: [] } } as never)

		const result = await geoByPlaceId({ input: 'nonexistent_place_id' } as never)

		expect(result.result).toBeUndefined()
	})

	/**
	 * Same root cause as #2075 (filed for geo.autocomplete) - `geocodeByPlaceIdResponse`'s `results` field is
	 * required, not optional, so a real Google error response (REQUEST_DENIED etc., which wouldn't include
	 * `results` at all) fails schema validation before `googleAPIResponseHandler`'s typed-error switch ever
	 * runs. Not re-filed as a separate issue - #2075 already flags checking the other geocode-response schemas
	 * for this same pattern.
	 */
	it('4.5c: a realistic Google error response (status, no results field) throws a raw parse error, matching the geo.autocomplete finding in #2075', async () => {
		geocodeMock.mockResolvedValueOnce({ data: { status: 'OVER_QUERY_LIMIT' } } as never)

		await expect(geoByPlaceId({ input: 'place_id_123' } as never)).rejects.toBeTruthy()
	})
})
