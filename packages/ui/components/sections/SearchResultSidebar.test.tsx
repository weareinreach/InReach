import { MantineProvider } from '@mantine/core'
import { render as rtlRender } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { deleteCookie, getCookie, setCookie } from 'cookies-next'
import { type ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SearchStateProvider } from '~ui/providers/SearchState'
import { testI18n } from '~ui/test/i18nTestInstance'
import { screen, waitFor } from '~ui/test/test-utils'
import { storybookTheme } from '~ui/theme/storybook'

import { SearchResultSidebar } from './SearchResultSidebar'

vi.mock('next/router', () => ({
	useRouter: () => ({ locale: 'en', query: {}, push: vi.fn(), replace: vi.fn() }),
}))

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		organization: {
			getCommunityFocusOptions: { useQuery: vi.fn() },
			searchName: { useQuery: vi.fn() },
		},
		geo: {
			autocomplete: { useQuery: vi.fn() },
			geoByPlaceId: { useQuery: vi.fn() },
		},
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const getCommunityFocusOptionsMock = vi.mocked(trpc.organization.getCommunityFocusOptions.useQuery)
// Only exercised by 9.8, which is the one case that renders SearchBox (onlySort=false) - given a
// safe default here so that render doesn't throw for every other case too.
vi.mocked(trpc.organization.searchName.useQuery).mockReturnValue({ data: undefined } as never)
vi.mocked(trpc.geo.autocomplete.useQuery).mockReturnValue({ data: undefined } as never)
vi.mocked(trpc.geo.geoByPlaceId.useQuery).mockReturnValue({ data: undefined } as never)

/**
 * Real ids/tags/tsKeys from packages/db/generated/allAttributes.ts - the raw handler shape
 * (organization.getCommunityFocusOptions calls `useQuery()` with no `select`). Tags match
 * SearchResultSidebar's own SIDEBAR_TAG_CONFIG map.
 */
const mockFocusOptions = [
	{
		id: 'attr_01GW2HHFVN72D7XEBZZJXCJQXQ',
		tag: 'bipoc-comm',
		tsNs: 'attribute',
		tsKey: 'srvfocus.bipoc-comm',
		icon: null,
	},
	{
		id: 'attr_01GW2HHFVRMQFJ9AMA633SQQGV',
		tag: 'hiv-comm',
		tsNs: 'attribute',
		tsKey: 'srvfocus.hiv-comm',
		icon: null,
	},
]

const loadingManager = { isLoading: false, setLoading: vi.fn() }

const renderSidebar = (props: Partial<Parameters<typeof SearchResultSidebar>[0]> = {}) => {
	const Wrapper = ({ children }: { children: ReactNode }) => (
		<MantineProvider theme={storybookTheme} defaultColorScheme='light'>
			<I18nextProvider i18n={testI18n}>
				{/* Only needed when onlySort=false renders SearchBox, which reads this context
				    unconditionally - included for every case for a single consistent wrapper. */}
				<SearchStateProvider initState={{ params: [] }}>{children}</SearchStateProvider>
			</I18nextProvider>
		</MantineProvider>
	)
	return rtlRender(
		<SearchResultSidebar resultCount={10} loadingManager={loadingManager} isAdvanced onlySort {...props} />,
		{ wrapper: Wrapper }
	)
}

beforeEach(() => {
	getCommunityFocusOptionsMock.mockReturnValue({ data: mockFocusOptions, isLoading: false } as never)
	deleteCookie('ir_active_focuses')
	deleteCookie('ir_focus_order')
	localStorage.clear()
})

afterEach(() => {
	deleteCookie('ir_active_focuses')
	deleteCookie('ir_focus_order')
	localStorage.clear()
})

describe('SearchResultSidebar', () => {
	it('9.1: no focus cookie and no legacy localStorage value - no switches pre-selected', async () => {
		renderSidebar()

		const bipoc = await screen.findByLabelText('BIPOC community')
		expect(bipoc).not.toBeChecked()
		expect(screen.getByLabelText('HIV+ community')).not.toBeChecked()
	})

	it('9.2: a legacy localStorage value migrates to the cookie and the key is removed', async () => {
		localStorage.setItem('ir_active_focuses', JSON.stringify(['attr_01GW2HHFVN72D7XEBZZJXCJQXQ']))

		renderSidebar()

		await waitFor(() => expect(screen.getByLabelText('BIPOC community')).toBeChecked())
		expect(getCookie('ir_active_focuses')).toBe(JSON.stringify(['attr_01GW2HHFVN72D7XEBZZJXCJQXQ']))
		expect(localStorage.getItem('ir_active_focuses')).toBeNull()
	})

	it('9.3: a stale/invalid focus ID in the cookie is dropped, not sent to the API', async () => {
		setCookie('ir_active_focuses', JSON.stringify(['youth', 'attr_01GW2HHFVN72D7XEBZZJXCJQXQ']))

		renderSidebar()

		await waitFor(() => expect(screen.getByLabelText('BIPOC community')).toBeChecked())
		// The invalid "youth" literal never round-trips into a checked switch - there's no focus
		// option with that id, so nothing named after it is even findable.
		expect(screen.queryByText('youth', { exact: false })).not.toBeInTheDocument()
	})

	it('9.4: toggling a switch on persists to the cookie and jumps to the top of the active order', async () => {
		renderSidebar()

		const hiv = await screen.findByLabelText('HIV+ community')
		await userEvent.setup().click(hiv)

		await waitFor(() => expect(hiv).toBeChecked())
		expect(getCookie('ir_active_focuses')).toBe(JSON.stringify(['attr_01GW2HHFVRMQFJ9AMA633SQQGV']))
		expect(getCookie('ir_focus_order')).toBe(
			JSON.stringify(['attr_01GW2HHFVRMQFJ9AMA633SQQGV', 'attr_01GW2HHFVN72D7XEBZZJXCJQXQ'])
		)
	})

	it('9.6: resultCount is 0 - focus switches are disabled but still visible', async () => {
		renderSidebar({ resultCount: 0 })

		const bipoc = await screen.findByLabelText('BIPOC community')
		expect(bipoc).toBeVisible()
		expect(bipoc).toBeDisabled()
	})

	it('9.7: isAdvanced is false - a "coming soon" overlay covers the switch group', async () => {
		renderSidebar({ isAdvanced: false })

		expect(await screen.findByText('Coming soon')).toBeInTheDocument()
		// The switches still render underneath the overlay, but are non-interactive via isAdvanced.
		expect(screen.getByLabelText('BIPOC community')).toBeDisabled()
	})

	it('9.8: onlySort mode shows only the focus switches - no result count text, no org search box, no suggest link, no anti-hate message', async () => {
		renderSidebar({ onlySort: true, resultCount: 10 })

		await screen.findByLabelText('BIPOC community')
		// index.tsx gates the sidebar's own `count.result` text behind `!onlySort` too, not just the
		// org-search/suggest/anti-hate block - confirmed intentional, not a gap: SortResults.tsx (the
		// mobile drawer that renders the sidebar with onlySort) shows the count itself, on its own
		// drawer-trigger button (`t('view-x-result', ...)`), so showing it again inside the sidebar
		// here would duplicate it.
		expect(screen.queryByText('10 results')).not.toBeInTheDocument()
		expect(screen.queryByText('Suggest a Resource')).not.toBeInTheDocument()
		expect(screen.queryByRole('link', { name: /suggest/i })).not.toBeInTheDocument()

		renderSidebar({ onlySort: false, resultCount: 10 })
		expect(await screen.findAllByText('Suggest a Resource')).not.toHaveLength(0)
	})
})
