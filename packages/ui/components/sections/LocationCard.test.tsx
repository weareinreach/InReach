import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '~ui/test/test-utils'

vi.mock('next/router', () => ({
	useRouter: () => ({ query: { slug: 'test-org' }, isReady: true, pathname: '/org/[slug]', push: vi.fn() }),
}))

// The card draws its location on a shared Google map; none of that is under test here.
vi.mock('~ui/hooks/useGoogleMaps', () => ({
	useGoogleMaps: () => ({
		map: undefined,
		mapIsReady: false,
		mapEvents: { initialPropsSet: { useSubscription: () => undefined } },
		camera: undefined,
		tweenGroup: { getAll: () => [], add: vi.fn(), remove: vi.fn() },
	}),
}))
vi.mock('~ui/hooks/useGoogleMapMarker', () => ({
	useGoogleMapMarker: () => ({ add: vi.fn(), remove: vi.fn(), get: vi.fn() }),
}))

const locationCardData = vi.hoisted(() => ({ current: undefined as unknown }))
vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		organization: { getIdFromSlug: { useQuery: () => ({ data: { id: 'orgn_test' } }) } },
		location: { forLocationCard: { useQuery: () => ({ data: locationCardData.current }) } },
		service: { forServiceInfoCard: { useQuery: () => ({ data: undefined, isLoading: false }) } },
		review: { getAverage: { useQuery: () => ({ data: undefined, status: 'success' }) } },
	},
}))

const { LocationCard } = await import('./LocationCard')

// What forLocationCard returns for a HIDDEN address to staff in edit mode: street redacted, city and
// district kept (see query.forLocationCard.handler.test.ts).
const hiddenAddressForStaff = {
	id: 'oloc_test',
	name: 'Downtown Clinic',
	street1: null,
	street2: null,
	city: 'Springfield',
	postCode: null,
	latitude: null,
	longitude: null,
	addressVisibility: 'HIDDEN',
	published: true,
	deleted: false,
	country: 'US',
	govDist: { abbrev: 'IL', tsKey: 'gov.il', tsNs: 'gov-dist' },
	phones: [],
	attributes: [],
	accessible: undefined,
	services: [],
}

/**
 * #2011: the card hid a HIDDEN location's whole address line in edit mode too, so staff couldn't tell an
 * org's locations apart by city - and passing edit mode to the API's redaction alone would have changed
 * nothing on screen.
 */
describe('LocationCard - HIDDEN address', () => {
	it('in edit mode, shows the city and state the API returns', () => {
		locationCardData.current = hiddenAddressForStaff
		render(<LocationCard locationId='oloc_test' edit />)

		expect(screen.getByText(/Springfield/)).toBeInTheDocument()
		expect(screen.queryByText(/123 Main St/)).not.toBeInTheDocument()
	})

	it('on the public card, shows no address line at all', () => {
		locationCardData.current = { ...hiddenAddressForStaff, city: null, govDist: null }
		render(<LocationCard locationId='oloc_test' />)

		expect(screen.getByText('Downtown Clinic')).toBeInTheDocument()
		expect(screen.queryByText(/Springfield/)).not.toBeInTheDocument()
	})
})
