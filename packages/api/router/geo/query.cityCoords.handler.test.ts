import { beforeEach, describe, expect, it, vi } from 'vitest'

// `cityCoords` keeps module-level `countryMap`/`govDistMap` caches (see 4.6) - each test resets the
// module registry and re-imports fresh so one test's cache population can't leak into another and make
// the "does it cache" assertion depend on run order.
vi.mock('@weareinreach/db', () => ({
	prisma: { country: { findMany: vi.fn() }, govDist: { findMany: vi.fn() } },
}))
vi.mock('~api/google', () => ({
	googleMapsApi: { geocode: vi.fn() },
}))

let prisma: (typeof import('@weareinreach/db'))['prisma']
let googleMapsApi: (typeof import('~api/google'))['googleMapsApi']
let cityCoords: (typeof import('./query.cityCoords.handler'))['default']

beforeEach(async () => {
	vi.resetModules()
	;({ prisma } = await import('@weareinreach/db'))
	;({ googleMapsApi } = await import('~api/google'))
	;({ default: cityCoords } = await import('./query.cityCoords.handler'))
	vi.mocked(prisma.country.findMany).mockReset()
	vi.mocked(prisma.govDist.findMany).mockReset()
	vi.mocked(googleMapsApi.geocode).mockReset()
})

describe('geo.cityCoords', () => {
	it('4.7: throws NOT_FOUND for a country id not present in the (active-for-orgs) country list, instead of silently geocoding with an undefined region', async () => {
		vi.mocked(prisma.country.findMany).mockResolvedValueOnce([{ id: 'ctry_us', cca2: 'US' }] as never)

		await expect(
			cityCoords({ input: { city: 'Nowhere', country: 'ctry_nonexistent' } } as never)
		).rejects.toThrow('Country not found')
		expect(googleMapsApi.geocode).not.toHaveBeenCalled()
	})

	it('resolves city coordinates via Google geocoding once the country is validated', async () => {
		vi.mocked(prisma.country.findMany).mockResolvedValueOnce([{ id: 'ctry_us', cca2: 'US' }] as never)
		vi.mocked(googleMapsApi.geocode).mockResolvedValueOnce({
			data: {
				status: 'OK',
				results: [
					{
						address_components: [],
						formatted_address: 'Springfield, US',
						geometry: {
							bounds: { northeast: { lat: 1, lng: 1 }, southwest: { lat: 0, lng: 0 } },
							location: { lat: 39.78, lng: -89.65 },
							location_type: 'APPROXIMATE',
							viewport: { northeast: { lat: 1, lng: 1 }, southwest: { lat: 0, lng: 0 } },
						},
						place_id: 'place_1',
						types: ['locality'],
					},
				],
			},
		} as never)

		const result = await cityCoords({ input: { city: 'Springfield', country: 'ctry_us' } } as never)

		// `geocodeByStringResponse`'s own transform collapses `results` from an array to a single object
		// when there's exactly one match (`results.length === 1 ? results.at(0) : results` - see
		// schemas/thirdParty/googleGeo.ts) - a real shape inconsistency worth knowing about, since a
		// consumer written expecting `results` to always be an array would break the moment a search
		// narrows to exactly one match. Not filed separately - `geo.cityCoords`'s one real caller
		// (`packages/ui/components/data-portal/AddressAutocomplete/index.tsx`) is a data-portal/org-edit
		// component, not part of the public search surface this doc scopes to.
		const single = Array.isArray(result.results) ? result.results[0] : result.results
		expect(single?.geometry.location).toEqual({ lat: 39.78, lng: -89.65 })
	})

	/**
	 * Documents current behavior, not asserted as either correct or a bug in this test - flagged in
	 * docs/Testing/search-api-test-inventory.md §4.6 for a product/eng decision: `countryMap` populates once
	 * per server process (`if (countryMap.size === 0)`) and never invalidates. A country added or deactivated
	 * in the DB after the first request is invisible to this handler until the process restarts. Countries
	 * change rarely, so this may be an acceptable tradeoff - but it's undocumented today, and this test exists
	 * so a future change to that caching strategy is a deliberate decision instead of an unnoticed behavior
	 * change.
	 */
	it('4.6: reuses the module-level country cache on a second call rather than re-querying', async () => {
		vi.mocked(prisma.country.findMany).mockResolvedValue([{ id: 'ctry_us', cca2: 'US' }] as never)
		vi.mocked(googleMapsApi.geocode).mockResolvedValue({ data: { status: 'OK', results: [] } } as never)

		await cityCoords({ input: { city: 'City One', country: 'ctry_us' } } as never)
		await cityCoords({ input: { city: 'City Two', country: 'ctry_us' } } as never)

		expect(prisma.country.findMany).toHaveBeenCalledTimes(1)
	})
})
