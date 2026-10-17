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

	it('4.4a: a non-OK Google status WITH a valid (possibly empty) predictions array throws a typed TRPCError', async () => {
		// `autocompleteResponse`'s Zod schema requires `predictions` unconditionally (not optional) -
		// this is the one shape of non-OK response that actually reaches googleAPIResponseHandler's
		// status switch. See 4.4b for what a real Google error response actually looks like.
		placeAutocompleteMock.mockResolvedValueOnce({
			data: { status: 'REQUEST_DENIED', predictions: [] },
		} as never)

		await expect(autocomplete({ input: { search: 'test' } } as never)).rejects.toThrow(TRPCError)
	})

	/**
	 * Correctly fails against the naive expectation (a typed TRPCError) - confirms a real gap, not a test
	 * mistake. Google's actual documented error responses (REQUEST_DENIED, OVER_QUERY_LIMIT, INVALID_REQUEST)
	 * do NOT include a `predictions` field - there's nothing to predict when the request itself was rejected.
	 * But `autocompleteResponse`'s Zod schema requires `predictions` as a non-optional array, so a real Google
	 * error response fails schema validation and throws a raw ZodError _before_ `googleAPIResponseHandler`'s
	 * status-based switch (which DOES produce clean typed TRPCErrors for these exact codes, per 4.4a) ever
	 * runs. In effect, that switch's REQUEST_DENIED / OVER_QUERY_LIMIT / INVALID_REQUEST / UNKNOWN_ERROR
	 * branches are dead code for this endpoint against any response Google would actually send back in an error
	 * case. Same downstream user impact as #2060 (SearchBox never surfaces a geocoding failure to the user) -
	 * this is a second, independent reason a real Google-side failure wouldn't produce a clean, catchable error
	 * client-side.
	 */
	it('4.4b: a realistic Google error response (status + no predictions field, matching real API behavior) throws a raw ZodError, not the typed TRPCError googleAPIResponseHandler would otherwise produce', async () => {
		placeAutocompleteMock.mockResolvedValueOnce({ data: { status: 'REQUEST_DENIED' } } as never)

		await expect(autocomplete({ input: { search: 'test' } } as never)).rejects.not.toBeInstanceOf(TRPCError)
	})
})
