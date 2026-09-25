import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createTRPCReact } from '@trpc/react-query'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { type AppRouter } from '@weareinreach/api'
import {
	buildTrpcTestWrapper,
	createFakeLocationBackend,
	createMswServer,
	GEO_COUNTRIES,
	LOCATION,
	ORG,
} from '~ui/test/trpcIntegrationHarness'

/**
 * Real-cache regression coverage for the contact-info "manual refresh" bug reported for the location address,
 * mirroring PhoneNumbers.realCache.test.tsx: save it, see it without refreshing, and reopen it to see the
 * latest saved state. Renders the real `VisitCard` (edit mode) together with the real `AddressDrawer` it
 * mounts as the address text's own trigger, backed by one real `QueryClient` and a real `trpc.Provider`, with
 * only the network boundary faked.
 */

vi.mock('next/router', () => ({
	useRouter: () => ({ query: { slug: ORG.slug }, pathname: '', push: vi.fn() }),
}))

vi.mock('~ui/hooks/useOrgInfo', () => ({
	useOrgInfo: () => ({ id: ORG.id, slug: ORG.slug }),
}))

const trpc = createTRPCReact<AppRouter>()
vi.mock('~ui/lib/trpcClient', () => ({ trpc }))

const { VisitCard } = await import('./VisitCard')

let backend: ReturnType<typeof createFakeLocationBackend>
const server = createMswServer([])
const country = GEO_COUNTRIES[0]

beforeAll(() => {
	server.listen({ onUnhandledRequest: 'error' })
})
beforeEach(() => {
	backend = createFakeLocationBackend()
	server.resetHandlers(...backend.handlers)
})
afterAll(() => server.close())

const renderCard = () => {
	const { Wrapper } = buildTrpcTestWrapper(trpc, { strictMode: true })
	const view = render(<VisitCard edit locationId={LOCATION.id} />, { wrapper: Wrapper })
	return view
}

const openDrawer = async (addressText: string | RegExp) => {
	const trigger = await screen.findByText(addressText)
	await userEvent.click(trigger)
	return screen.findByRole('heading', { name: 'Edit Location' })
}

const clickSave = async () => {
	await waitFor(() => {
		expect(screen.getByRole('button', { name: /^Save$/ })).toBeEnabled()
	})
	await userEvent.click(screen.getByRole('button', { name: /^Save$/ }))
}

describe('VisitCard + AddressDrawer - real cache: edit, save, see it without refreshing, reopen shows latest', () => {
	it('reflects a city edit in both the visit card and the reopened form, never reverting to the earlier value', async () => {
		backend.seedLocation({
			id: LOCATION.id,
			name: 'Test Location',
			city: 'Original City',
			street1: '123 Main St',
			countryId: country.id,
			govDistId: country.govDist[0].id,
			addressVisibility: 'FULL',
		})
		renderCard()

		// Baseline: the card shows the seeded address.
		await screen.findByText(/original city/i)

		await openDrawer(/original city/i)
		const cityInput = screen.getByRole('textbox', { name: /^city$/i })
		await waitFor(() => expect(cityInput).toHaveValue('Original City'))

		await userEvent.clear(cityInput)
		await userEvent.type(cityInput, 'Updated City')
		await clickSave()
		await waitFor(() =>
			expect(screen.queryByRole('heading', { name: 'Edit Location' })).not.toBeInTheDocument()
		)

		// Contract 1: the visit card reflects the new city without any refresh - only React Query's
		// own reactivity (the mutation's cache patch + the card's own query re-render).
		await screen.findByText(/updated city/i)
		expect(screen.queryByText(/^original city/i)).not.toBeInTheDocument()

		// Contract 2: reopening the drawer shows the new city, not the original - this is the exact
		// bug reported live for address edits specifically ("must manually refresh to see changes"),
		// since `AddressDrawer` previously had no cache-patching at all, unlike the other contact-info
		// drawers.
		await openDrawer(/updated city/i)
		await waitFor(() => {
			expect(screen.getByRole('textbox', { name: /^city$/i })).toHaveValue('Updated City')
		})
	})
})
