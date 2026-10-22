import { TRPCError } from '@trpc/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~api/google', () => ({
	googleMapsApi: { placeAutocomplete: vi.fn() },
}))

const { googleMapsApi } = await import('~api/google')
const { default: autocomplete } = await import('./query.autocomplete.handler')

const placeAutocompleteMock = vi.mocked(googleMapsApi.placeAutocomplete)

const okResponse = (predictions: unknown[] = []) => ({
	data: { status: 'OK', predictions },
})

beforeEach(() => {
	placeAutocompleteMock.mockReset()
})

describe('geo.autocomplete', () => {
	it('4.1: cityOnly requests the `cities` Google Places type specifically', async () => {
		placeAutocompleteMock.mockResolvedValueOnce(okResponse() as never)

		await autocomplete({ input: { search: 'Port', cityOnly: true } } as never)

		expect(placeAutocompleteMock).toHaveBeenCalledWith(
			expect.objectContaining({ params: expect.objectContaining({ types: ['(cities)'] }) })
		)
	})

	it('4.2: fullAddress requests the `address` Google Places type', async () => {
		placeAutocompleteMock.mockResolvedValueOnce(okResponse() as never)

		await autocomplete({ input: { search: '123 Main St', fullAddress: true } } as never)

		expect(placeAutocompleteMock).toHaveBeenCalledWith(
			expect.objectContaining({ params: expect.objectContaining({ types: ['address'] }) })
		)
	})

	it('4.3: neither flag set falls back to the broader default type list (the path the covered SearchBox UI tests exercise every day, never asserted at the request-shape level until now)', async () => {
		placeAutocompleteMock.mockResolvedValueOnce(okResponse() as never)

		await autocomplete({ input: { search: 'Spring' } } as never)

		expect(placeAutocompleteMock).toHaveBeenCalledWith(
			expect.objectContaining({
				params: expect.objectContaining({
					types: [
						'administrative_area_level_2',
						'administrative_area_level_3',
						'neighborhood',
						'locality',
						'postal_code',
					],
				}),
			})
		)
	})

	/**
	 * #2075: the real Google client never returns an error status as data - its HTTP adapter turns
	 * OVER_QUERY_LIMIT, REQUEST_DENIED etc. into an HTTP 4xx/5xx and rejects with an AxiosError carrying
	 * Google's response body. These mocks reject the same way (the previous 4.4a/4.4b resolved with error data,
	 * a path the real client never takes). Each status should become a typed TRPCError instead of a generic
	 * 500.
	 */
	const googleRejection = (httpStatus: number, status: string, errorMessage?: string) =>
		Object.assign(new Error(`Request failed with status code ${httpStatus}`), {
			isAxiosError: true,
			response: {
				status: httpStatus,
				data: { status, ...(errorMessage ? { error_message: errorMessage } : {}) },
			},
		})

	it.each([
		[429, 'OVER_QUERY_LIMIT', 'TOO_MANY_REQUESTS'],
		[429, 'OVER_DAILY_LIMIT', 'TOO_MANY_REQUESTS'],
		[400, 'INVALID_REQUEST', 'BAD_REQUEST'],
		[403, 'REQUEST_DENIED', 'INTERNAL_SERVER_ERROR'],
		[500, 'UNKNOWN_ERROR', 'INTERNAL_SERVER_ERROR'],
	])('4.4: a Google %s %s response becomes a TRPCError with code %s', async (httpStatus, status, code) => {
		placeAutocompleteMock.mockRejectedValueOnce(googleRejection(httpStatus, status, 'from Google'))

		const error = await autocomplete({ input: { search: 'test' } } as never).catch((e: unknown) => e)

		expect(error).toBeInstanceOf(TRPCError)
		expect(error).toMatchObject({ code, message: 'from Google' })
	})

	it('4.4: a failure that is not a Google error response (e.g. the network) is rethrown unchanged', async () => {
		const networkError = new Error('socket hang up')
		placeAutocompleteMock.mockRejectedValueOnce(networkError)

		await expect(autocomplete({ input: { search: 'test' } } as never)).rejects.toBe(networkError)
	})
})
