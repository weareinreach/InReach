import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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

describe('AddressDrawer - address autocomplete does not duplicate city/state into street1', () => {
	it('writes only the street portion of the picked suggestion, not the full "street, city, state, country" prediction text', async () => {
		backend.seedLocation({
			id: LOCATION.id,
			name: 'Test Location',
			city: 'Original City',
			street1: '123 Main St',
			countryId: country.id,
			govDistId: country.govDist[0].id,
			addressVisibility: 'FULL',
		})
		// No `placeId` on this fixture - `handleAutocompleteSelection` early-returns without one, so the
		// async geocode-correction lookup (`geo.geoByPlaceId`) never fires. This isolates exactly the
		// code path that was buggy (the synchronous write on option-submit) from the separate, best-effort
		// correction effect that can independently clean up `street1` later - the immediate write must
		// already be correct on its own, since a user can save before (or without) that effect ever
		// resolving.
		backend.seedAutocomplete('1 Bethany Road', [
			{
				value: '1 Bethany Road, Hazlet, NJ, USA',
				label: '1 Bethany Road',
				subheading: 'Hazlet, NJ, USA',
				placeId: '',
			},
		])
		renderCard()

		await openDrawer(/original city/i)
		const street1Input = screen.getByRole('textbox', { name: /^address$/i })
		await waitFor(() => expect(street1Input).toHaveValue('123 Main St'))

		await userEvent.clear(street1Input)
		await userEvent.type(street1Input, '1 Bethany Road')

		// Mantine's `Combobox.Dropdown` renders via an inline-`display:none` wrapper that jsdom never
		// flips to visible (no real layout/animation engine) - `userEvent.click` refuses to click
		// anything it considers non-visible, and role-based queries exclude it from the accessibility
		// tree entirely. The option is still genuinely present in the DOM with its real `onClick`
		// handler wired up, so a plain `fireEvent.click` (no visibility check) still exercises the exact
		// code this test targets - the fix is about what `handleOptionSubmit` writes, not about the
		// dropdown's CSS-driven open/close animation.
		const optionSelector = `[role="option"][value="1 Bethany Road, Hazlet, NJ, USA"]`
		await waitFor(() => expect(document.querySelector(optionSelector)).not.toBeNull())
		const option = document.querySelector(optionSelector)
		if (!option) {
			throw new Error('autocomplete option never rendered')
		}
		fireEvent.click(option)

		// The option's full prediction text (`item.value`, city/state/country included) was being
		// written into street1 instead of just its street portion (`item.label`) - this duplicated the
		// city/state once the address was later composed with those fields for display, e.g.
		// "1 Bethany Road, Hazlet, NJ, USA, Hazlet, NJ 07730".
		expect(street1Input).toHaveValue('1 Bethany Road')
		expect(street1Input).not.toHaveValue('1 Bethany Road, Hazlet, NJ, USA')
	})
})

describe('AddressDrawer - unsaved changes confirmation (#2090)', () => {
	it('prompts before discarding an in-progress edit, and reverts to the last-saved value on discard', async () => {
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

		await openDrawer(/original city/i)
		const cityInput = screen.getByRole('textbox', { name: /^city$/i })
		await waitFor(() => expect(cityInput).toHaveValue('Original City'))

		await userEvent.clear(cityInput)
		await userEvent.type(cityInput, 'Unsaved Edit')

		await userEvent.click(screen.getByRole('button', { name: /close/i }))

		const modalHeading = await screen.findByRole('heading', { name: 'Unsaved Changes' })
		expect(modalHeading).toBeInTheDocument()

		await userEvent.click(screen.getByRole('button', { name: /^discard$/i }))

		await waitFor(() =>
			expect(screen.queryByRole('heading', { name: 'Edit Location' })).not.toBeInTheDocument()
		)

		// The card itself must not show the discarded, never-saved edit.
		expect(screen.queryByText(/unsaved edit/i)).not.toBeInTheDocument()
		await screen.findByText(/original city/i)

		// Reopening confirms the discard reverted the form too, not just the card.
		await openDrawer(/original city/i)
		await waitFor(() => {
			expect(screen.getByRole('textbox', { name: /^city$/i })).toHaveValue('Original City')
		})
	})

	it('closes without prompting when there are no unsaved changes', async () => {
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

		await openDrawer(/original city/i)
		await userEvent.click(screen.getByRole('button', { name: /close/i }))

		expect(screen.queryByRole('heading', { name: 'Unsaved Changes' })).not.toBeInTheDocument()
		await waitFor(() =>
			expect(screen.queryByRole('heading', { name: 'Edit Location' })).not.toBeInTheDocument()
		)
	})
})
