import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createTRPCReact } from '@trpc/react-query'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { type AppRouter } from '@weareinreach/api'
import {
	buildTrpcTestWrapper,
	createFakeOrgPhoneBackend,
	createMswServer,
	ORG,
} from '~ui/test/trpcIntegrationHarness'

/**
 * Real-cache regression coverage for the "just standard UI" contract the per-hook-mocked tests in
 * PhoneDrawer/index.test.tsx and PhoneNumbers.test.tsx cannot verify: save it, see it without refreshing, and
 * reopen it to see the latest saved state - every time, across repeated edits. This renders the real
 * `PhoneNumbers` (edit mode) together with the real `PhoneDrawer`s it mounts per row, backed by one real
 * `QueryClient` and a real `trpc.Provider`, with only the network boundary faked (see
 * ~ui/test/trpcIntegrationHarness.tsx) - so a bug where one component instance's write poisons what a
 * different instance reads via the shared cache can actually be caught here.
 */

vi.mock('next/router', () => ({
	useRouter: () => ({ query: { slug: ORG.slug }, pathname: '', push: vi.fn() }),
}))

const trpc = createTRPCReact<AppRouter>()
vi.mock('~ui/lib/trpcClient', () => ({ trpc }))

const { PhoneNumbers } = await import('./PhoneNumbers')

let backend: ReturnType<typeof createFakeOrgPhoneBackend>
const server = createMswServer([])

beforeAll(() => {
	server.listen({ onUnhandledRequest: 'error' })
})
// A fresh backend (and matching handlers) every test - the fake backend's Maps are plain closure
// state that would otherwise persist across tests in this file (msw's `resetHandlers` only resets
// which handlers are installed, not any state their closures capture), so re-running the same number
// in two tests would silently collide against leftover data from an earlier one.
beforeEach(() => {
	backend = createFakeOrgPhoneBackend()
	server.resetHandlers(...backend.handlers)
})
afterAll(() => server.close())

const renderList = () => {
	const { Wrapper } = buildTrpcTestWrapper(trpc, { strictMode: true })
	const view = render(<PhoneNumbers edit parentId={ORG.id} />, { wrapper: Wrapper })
	return view
}

// PhoneNumbersEdit renders every trigger (each list row, and "Create new") through `PhoneDrawer`'s
// polymorphic `component={Link}`, and `Link` renders a plain `<a>` with no `href` for this
// drawer-opening use case - an anchor without `href` gets no implicit ARIA role, so `getByRole('link',
// ...)` can't find it. `getByText` (the same pattern the existing PhoneNumbers.test.tsx already uses)
// finds the element by its visible text instead and relies on the click bubbling to the real handler.
// `findByText` (not `getByText`) because the target row is often not there yet - the list's own
// query, and any invalidate-triggered refetch after a save, are real (fake-network) async round trips
// here, unlike the per-hook-mocked tests elsewhere that hand back data synchronously.
const openDrawerFor = async (name: string | RegExp) => {
	const trigger = await screen.findByText(name)
	await userEvent.click(trigger)
	return screen.findByRole('heading', { name: /Add New|Edit/ })
}

// The header Save button is `disabled={!formIsDirty}` - react-hook-form's own dirty-tracking updates
// asynchronously relative to the triggering interaction (a checkbox toggle, a masked-input change),
// so clicking Save immediately after can land on a button that hasn't re-enabled yet. Waiting for it
// to become enabled first makes the click meaningful instead of a no-op on a disabled button.
// Re-queries inside `waitFor` (not a single captured reference) for the same reason `openDrawerFor`
// does: this element can get re-rendered while waiting, and clicking a stale/detached node from an
// earlier render is a silent no-op - it looks identical to a real click but never reaches the form,
// which is exactly what produced a false "drawer didn't close" failure here once already.
const clickSave = async () => {
	await waitFor(() => {
		expect(screen.getByRole('button', { name: /^Save$/ })).toBeEnabled()
	})
	await userEvent.click(screen.getByRole('button', { name: /^Save$/ }))
}

describe('PhoneNumbers + PhoneDrawer - real cache: create, save, see it without refreshing', () => {
	it('shows the new phone in the list immediately, then opens with the same values (not blank)', async () => {
		renderList()
		await screen.findByText(/create new/i)

		await openDrawerFor(/create new/i)
		fireEvent.change(screen.getByRole('textbox', { name: /phone number/i }), {
			target: { value: '+12025550100' },
		})
		// Re-querying (not reusing the element handed to fireEvent) rather than trusting that
		// reference stays live - PhoneNumberEntry can swap the masked input for a different element
		// (its raw-fallback path) under some conditions, which would otherwise leave this asserting
		// against a detached node forever instead of the one actually on screen.
		await waitFor(() => {
			expect(screen.getByRole('textbox', { name: /phone number/i })).toHaveValue('(202) 555-0100')
		})

		await clickSave()
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Add New/ })).not.toBeInTheDocument())

		// Contract 1: the list reflects the newly created phone without any refresh - only React
		// Query's own reactivity (the mutation's onSettled invalidate + the list query's refetch).
		await screen.findByText('(202) 555-0100')

		// Contract 2: opening that same new phone from the list shows what was actually saved, not a
		// blank form - this is the exact bug reported live ("create a number, save it, click to edit
		// it - the form is empty").
		await openDrawerFor('(202) 555-0100')
		await waitFor(() => {
			expect(screen.getByRole('textbox', { name: /phone number/i })).toHaveValue('(202) 555-0100')
		})
	})

	/**
	 * Direct repro of a live report: create new, enter a number, pick a real phone type (not "Custom Text"),
	 * untick Published, save - the new phone never appeared in the list without refreshing the page twice. The
	 * test above only exercised the defaults (no type change, published left on), so it never touched this
	 * combination.
	 */
	it('shows a newly created phone in the list when a real type is selected and Published is unticked', async () => {
		renderList()
		await screen.findByText(/create new/i)

		await openDrawerFor(/create new/i)
		fireEvent.change(screen.getByRole('textbox', { name: /phone number/i }), {
			target: { value: '+12025550100' },
		})
		await waitFor(() => {
			expect(screen.getByRole('textbox', { name: /phone number/i })).toHaveValue('(202) 555-0100')
		})

		await userEvent.click(screen.getByRole('combobox', { name: 'Type' }))
		await userEvent.click(await screen.findByText('main'))
		await userEvent.click(screen.getByRole('checkbox', { name: /published/i }))

		await clickSave()
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Add New/ })).not.toBeInTheDocument())

		await screen.findByText('(202) 555-0100')
	})
})

describe('PhoneNumbers + PhoneDrawer - real cache: edit, save, reopen shows the latest', () => {
	it('reflects each successive edit in both the list and the reopened form, never reverting to an earlier value', async () => {
		backend.seedOrgPhone({ number: '+12025550100', countryId: 'country_us', published: true })
		const { container } = renderList()

		// Baseline: opening the seeded phone shows the seeded value. `forEditDrawer` only starts
		// fetching once the drawer opens, so the field is briefly blank before this resolves - a real
		// async round trip here (unlike the per-hook-mocked tests, which hand back data synchronously).
		await openDrawerFor('(202) 555-0100')
		await waitFor(() => {
			expect(screen.getByRole('textbox', { name: /phone number/i })).toHaveValue('(202) 555-0100')
		})

		// Edit 1: change the number itself. Unlike the createNew case above (a blank field, which
		// starts in `defaultCountry` mode and accepts a full "+1..." value), this field already has a
		// fixed `country` from the loaded record, which switches the masked input to strict national
		// format - a leading "+1" here gets parsed as the digit "1" glued onto the national number
		// (e.g. "1 (202) 555-0199") instead of being recognized as a country calling code.
		fireEvent.change(screen.getByRole('textbox', { name: /phone number/i }), {
			target: { value: '2025550199' },
		})
		await waitFor(() => {
			expect(screen.getByRole('textbox', { name: /phone number/i })).toHaveValue('(202) 555-0199')
		})
		await clickSave()
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Edit/ })).not.toBeInTheDocument())

		// Contract 1, edit 1: list shows the new number without a refresh: the old one is gone.
		await screen.findByText('(202) 555-0199')
		expect(screen.queryByText('(202) 555-0100')).not.toBeInTheDocument()

		// Contract 2, edit 1: reopening shows the new number, not the original.
		await openDrawerFor('(202) 555-0199')
		await waitFor(() => {
			expect(screen.getByRole('textbox', { name: /phone number/i })).toHaveValue('(202) 555-0199')
		})

		// Edit 2, on the same record: unpublish it.
		await userEvent.click(screen.getByRole('checkbox', { name: /published/i }))
		await clickSave()
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Edit/ })).not.toBeInTheDocument())

		// Contract 1, edit 2: list shows the unpublished (eye-off) state immediately, still on the
		// number saved in edit 1 - the two edits must compound, not overwrite each other.
		await screen.findByText('(202) 555-0199')
		await waitFor(() => {
			expect(container.querySelector('[icon="carbon:view-off"]')).toBeInTheDocument()
		})

		// Contract 2, edit 2: reopening shows BOTH edits - the new number AND unpublished - not a
		// reversion to the original number or to "published".
		await openDrawerFor('(202) 555-0199')
		await waitFor(() => {
			expect(screen.getByRole('textbox', { name: /phone number/i })).toHaveValue('(202) 555-0199')
		})
		expect(screen.getByRole('checkbox', { name: /published/i })).not.toBeChecked()
	})
})
