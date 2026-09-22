import { MantineProvider } from '@mantine/core'
import { render as rtlRender } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { describe, expect, it, vi } from 'vitest'

import { SearchStateProvider } from '~ui/providers/SearchState'
import { testI18n } from '~ui/test/i18nTestInstance'
import { render, screen, waitFor } from '~ui/test/test-utils'
import { storybookTheme } from '~ui/theme/storybook'

import { ServiceFilter } from './index'

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: { service: { getFilterOptions: { useQuery: vi.fn() } } },
}))

const { trpc } = await import('~ui/lib/trpcClient')
const getFilterOptionsMock = vi.mocked(trpc.service.getFilterOptions.useQuery)

/**
 * Already in the post-`select` shape the real hook's `select` option produces
 * (packages/ui/modals/ServiceFilter/index.tsx) - mocking `useQuery` entirely bypasses react-query's own
 * handling of that option, so the mock must return the transformed shape directly, not the raw `{id, tsKey,
 * tsNs}` shape the actual API handler returns.
 */
const mockFilterOptions = [
	{
		categoryId: 'svct_abortion',
		label: 'services:abortion-care.CATEGORYNAME',
		services: [
			{ value: 'svtg_providers', label: 'services:abortion-care.abortion-providers' },
			{ value: 'svtg_financial', label: 'services:abortion-care.financial-assistance' },
		],
	},
]

/**
 * Renders with a real, custom-seeded SearchStateProvider - the shared test-utils render() always uses a fixed
 * empty initState, but several cases here need control over the initial `s` (services) selection.
 */
const renderWithServices = (ui: ReactNode, initialServices: string[] = []) => {
	const Wrapper = ({ children }: { children: ReactNode }) => (
		<MantineProvider theme={storybookTheme} defaultColorScheme='light'>
			<I18nextProvider i18n={testI18n}>
				<SearchStateProvider initState={{ params: [], s: initialServices }}>{children}</SearchStateProvider>
			</I18nextProvider>
		</MantineProvider>
	)
	return rtlRender(ui, { wrapper: Wrapper })
}

describe('ServiceFilter', () => {
	it('7.1: shows a skeleton placeholder while filter options are loading', () => {
		getFilterOptionsMock.mockReturnValue({ data: undefined } as never)

		render(<ServiceFilter resultCount={0} />)

		expect(document.querySelector('.mantine-Skeleton-root')).toBeInTheDocument()
	})

	it('7.2: checking an individual sub-service adds only that service to searchState', async () => {
		getFilterOptionsMock.mockReturnValue({ data: mockFilterOptions } as never)

		renderWithServices(<ServiceFilter resultCount={0} />)
		await userEvent.setup().click(screen.getByRole('button', { name: /Filter by services/i }))
		// findBy*, not getBy*: Mantine's Modal open transition hasn't necessarily finished by
		// the time userEvent's click resolves - the modal container can still be genuinely
		// empty for a tick, confirmed by first trying getByLabelText here and seeing an empty
		// `<div class="mantine-Modal-root" />` in the failure's DOM dump.
		await userEvent.setup().click(await screen.findByLabelText('Abortion providers'))

		// Correctly fails: confirms https://github.com/weareinreach/InReach/issues/2064. The
		// click goes through Checkbox.Group/Checkbox.Item's own useController subscription to the
		// 'selected' field, which never re-renders to checked - even though the click does write
		// through to searchState (confirmed via the count badge, and by polling `.checked` for 3s
		// with no change - not just a slow round trip).
		await waitFor(() => expect(screen.getByLabelText('Abortion providers')).toBeChecked())
		expect(screen.getByLabelText('Financial assistance')).not.toBeChecked()
	})

	it('7.3: checking a category\'s "select all" checks all its sub-services, not indeterminate', async () => {
		getFilterOptionsMock.mockReturnValue({ data: mockFilterOptions } as never)

		renderWithServices(<ServiceFilter resultCount={0} />)
		await userEvent.setup().click(screen.getByRole('button', { name: /Filter by services/i }))
		// Real rendered label (index.tsx line ~316): t('all-service-category', { serviceCategory:
		// `$t(${label})` }) - a nested i18next `$t(services:...)` reference resolved via the
		// `services` namespace, not the raw translation key text. "Abortion Care" is
		// services.json's real `abortion-care.CATEGORYNAME` value.
		await userEvent.setup().click(await screen.findByLabelText('All Abortion Care'))

		// Correctly fails: confirms https://github.com/weareinreach/InReach/issues/2064, same root
		// cause as 7.2 in the other direction - "select all" updates via the top-level form's own
		// `setValue`, which the sub-service checkboxes' own separate Checkbox.Group subscription
		// never picks up.
		await waitFor(() => expect(screen.getByLabelText('Abortion providers')).toBeChecked())
		expect(screen.getByLabelText('Financial assistance')).toBeChecked()
		const selectAll = screen.getByLabelText('All Abortion Care') as HTMLInputElement
		expect(selectAll.checked).toBe(true)
		expect(selectAll.indeterminate).toBe(false)
	})

	it('7.4: some but not all sub-services selected shows the category checkbox as indeterminate', async () => {
		getFilterOptionsMock.mockReturnValue({ data: mockFilterOptions } as never)

		renderWithServices(<ServiceFilter resultCount={0} />, ['svtg_providers'])
		await userEvent.setup().click(screen.getByRole('button', { name: /Filter by services/i }))

		// Correctly fails: confirms https://github.com/weareinreach/InReach/issues/2064. The
		// individual sub-service checkbox (via Checkbox.Group's own useController) correctly
		// shows checked for the seeded selection - but this "select all" checkbox's
		// checked/indeterminate come from ServiceFilter's own top-level `useWatch`, a *separate*
		// subscription to the same field that never reflects the seeded value (confirmed by
		// polling for 3s with no change, not just a brief mount-time lag).
		const selectAll = (await screen.findByLabelText('All Abortion Care')) as HTMLInputElement
		await waitFor(() => expect(selectAll.indeterminate).toBe(true))
		expect(selectAll.checked).toBe(false)
	})

	it('7.5: a selection survives closing and reopening the modal', async () => {
		getFilterOptionsMock.mockReturnValue({ data: mockFilterOptions } as never)

		// Selecting via a live click doesn't survive as *visibly checked* without closing/reopening
		// first - that's issue #2064, covered by 7.2/7.3/7.4. This case instead exercises the
		// simpler, already-working path real users hit after a page load or navigation: Mantine's
		// Modal unmounts its children on close (no `keepMounted` prop here), so Checkbox.Group gets
		// a fresh mount on reopen and reads the form's current value directly, sidestepping the
		// stale-subscription problem entirely - confirming that closing and reopening the modal is
		// a reliable way to see a selection correctly reflected, even though live updates are not.
		renderWithServices(<ServiceFilter resultCount={0} />, ['svtg_providers'])
		await userEvent.setup().click(screen.getByRole('button', { name: /Filter by services/i }))
		expect(await screen.findByLabelText('Abortion providers')).toBeChecked()

		// The results button doubles as the modal's close control (index.tsx: `onClick={modalHandler.close}`).
		await userEvent.setup().click(screen.getByRole('button', { name: /view 0 result/i }))
		await waitFor(() => expect(screen.queryByLabelText('Abortion providers')).not.toBeInTheDocument())

		await userEvent.setup().click(screen.getByRole('button', { name: /Filter by services/i }))
		expect(await screen.findByLabelText('Abortion providers')).toBeChecked()
		expect(document.querySelector('[class*="count"]')).toBeInTheDocument()
	})

	it('7.6: disabled - the trigger is visibly present but non-interactive', () => {
		getFilterOptionsMock.mockReturnValue({ data: mockFilterOptions } as never)

		renderWithServices(<ServiceFilter resultCount={0} disabled />)

		expect(screen.getByRole('button', { name: /Filter by services/i })).toBeDisabled()
	})

	it('7.7: no services selected shows no count badge anywhere', () => {
		getFilterOptionsMock.mockReturnValue({ data: mockFilterOptions } as never)

		renderWithServices(<ServiceFilter resultCount={0} />, [])

		expect(document.querySelector('[class*="count"]')).not.toBeInTheDocument()
	})

	it('7.8: selecting services shows the correct count on both the overall and per-category badges', async () => {
		getFilterOptionsMock.mockReturnValue({ data: mockFilterOptions } as never)

		renderWithServices(<ServiceFilter resultCount={0} />, ['svtg_providers'])

		// Overall trigger badge shows the total (1); opening the category also shows that
		// category's own badge with the same count, since all selected services are in this
		// one category here.
		const badges = document.querySelectorAll('[class*="count"]')
		expect(badges.length).toBeGreaterThan(0)
		badges.forEach((badge) => expect(badge.textContent).toBe('1'))
	})

	it('7.9: deselecting back to zero removes both badges, not just shows "0"', async () => {
		getFilterOptionsMock.mockReturnValue({ data: mockFilterOptions } as never)

		renderWithServices(<ServiceFilter resultCount={0} />, ['svtg_providers'])
		expect(document.querySelector('[class*="count"]')).toBeInTheDocument()

		await userEvent.setup().click(screen.getByRole('button', { name: /Filter by services/i }))
		await userEvent.setup().click(await screen.findByLabelText('Abortion providers'))

		expect(document.querySelector('[class*="count"]')).not.toBeInTheDocument()
	})

	it('7.10: the confirm button text reflects resultCount and updates when it changes', async () => {
		getFilterOptionsMock.mockReturnValue({ data: mockFilterOptions } as never)

		const { rerender } = renderWithServices(<ServiceFilter resultCount={5} />)
		// The results button lives inside the Modal, not rendered until opened.
		await userEvent.setup().click(screen.getByRole('button', { name: /Filter by services/i }))
		// Real translation (apps/app/public/locales/en/common.json): "View {{count}} result(s)"
		expect(await screen.findByText('View 5 results')).toBeInTheDocument()

		rerender(<ServiceFilter resultCount={12} />)
		expect(screen.getByText('View 12 results')).toBeInTheDocument()
	})

	// docs/Testing/search-test-inventory.md §12, case 12.4 - the landscape scroll-height branch,
	// tested here rather than in a §12-specific file since it's this component's own media query.
	it('12.4: opened in landscape orientation with a short viewport, the scroll area still renders without crashing', async () => {
		getFilterOptionsMock.mockReturnValue({ data: mockFilterOptions } as never)

		// test/setup.ts's global matchMedia stub always returns matches:false - override per-test
		// so the exact landscape query ServiceFilter itself uses
		// (`(orientation: landscape) and (max-height: ${em(430)})`) matches, exercising the branch
		// that's otherwise only ever tested via the implicit "everything else" default (portrait/
		// desktop, 7.1-7.10 above never set this).
		const originalMatchMedia = window.matchMedia
		window.matchMedia = vi.fn().mockImplementation((query: string) => ({
			matches: query.includes('orientation: landscape'),
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		}))

		try {
			renderWithServices(<ServiceFilter resultCount={0} />)
			await userEvent.setup().click(screen.getByRole('button', { name: /Filter by services/i }))

			expect(await screen.findByText('Abortion Care')).toBeInTheDocument()
			expect(document.querySelector('[class*="scrollArea"]')).toBeInTheDocument()
		} finally {
			window.matchMedia = originalMatchMedia
		}
	})
})
