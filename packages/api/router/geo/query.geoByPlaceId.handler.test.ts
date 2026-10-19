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
	 * #2075: the real Google client rejects an error status (here OVER_QUERY_LIMIT) as an AxiosError carrying
	 * Google's body - it never resolves with it as data, which is what the previous 4.5c mocked. It should
	 * become a typed TRPCError, not a generic 500.
	 */
	it('4.5c: a Google OVER_QUERY_LIMIT response becomes a TOO_MANY_REQUESTS TRPCError', async () => {
		geocodeMock.mockRejectedValueOnce(
			Object.assign(new Error('Request failed with status code 429'), {
				isAxiosError: true,
				response: { status: 429, data: { status: 'OVER_QUERY_LIMIT' } },
			})
		)

		await expect(geoByPlaceId({ input: 'place_id_123' } as never)).rejects.toMatchObject({
			code: 'TOO_MANY_REQUESTS',
		})
	})
})
