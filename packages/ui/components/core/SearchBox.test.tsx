import { MantineProvider } from '@mantine/core'
import { render as rtlRender } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SearchStateProvider } from '~ui/providers/SearchState'
import { testI18n } from '~ui/test/i18nTestInstance'
import { render, screen, waitFor } from '~ui/test/test-utils'
import { testTheme } from '~ui/test/testTheme'

import { SearchBox } from './SearchBox'

const pushMock = vi.fn()
vi.mock('next/router', () => ({
	useRouter: () => ({ locale: 'en', query: {}, push: pushMock, replace: vi.fn() }),
}))

beforeEach(() => {
	pushMock.mockClear()
	// A safe, always-destructurable default - SearchBox calls this hook unconditionally
	// regardless of `type` (org vs. location), even though it's functionally disabled via
	// `enabled: ... && !isOrgSearch`; mocking the hook entirely bypasses that react-query
	// behavior, so every test needs *some* configured return value or the component throws
	// trying to destructure `data` from `undefined`. Tests that care about this query's actual
	// behavior (2.6, 2.8) override it explicitly within the test body, after this runs.
	geoByPlaceIdMock.mockReturnValue({ data: undefined } as never)
})

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		organization: { searchName: { useQuery: vi.fn() } },
		geo: {
			autocomplete: { useQuery: vi.fn() },
			geoByPlaceId: { useQuery: vi.fn() },
		},
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const autocompleteMock = vi.mocked(trpc.geo.autocomplete.useQuery)
const geoByPlaceIdMock = vi.mocked(trpc.geo.geoByPlaceId.useQuery)
const searchNameMock = vi.mocked(trpc.organization.searchName.useQuery)

const loadingManager = { isLoading: false, setLoading: vi.fn() }

/**
 * SearchBox debounces input by 400ms (useDebouncedValue) before querying - real timers, not fake ones, since
 * Mantine's debounce hook and userEvent's own internal timing don't reliably coexist with vi.useFakeTimers()
 * here.
 */
const typeAndWaitForDebounce = async (input: HTMLElement, text: string) => {
	const user = userEvent.setup()
	await user.type(input, text)
	// SearchBox debounces the typed value (400ms) before it reaches the queries. Wait for that to actually
	// happen rather than sleeping a fixed time, which a slow/contended runner can outlast. Both queries
	// receive the same `search` on every render (only `enabled` differs by mode), so either mock works.
	await waitFor(() =>
		expect(autocompleteMock).toHaveBeenLastCalledWith(
			expect.objectContaining({ search: text }),
			expect.anything()
		)
	)
}

describe('SearchBox (location mode)', () => {
	it('2.2: shows a loading indicator while suggestions are still loading', async () => {
		autocompleteMock.mockReturnValue({ data: undefined, isFetching: true } as never)
		geoByPlaceIdMock.mockReturnValue({ data: undefined } as never)
		searchNameMock.mockReturnValue({ data: undefined, isFetching: false } as never)

		render(<SearchBox type='location' loadingManager={loadingManager} />)
		const input = screen.getByRole('textbox')
		await typeAndWaitForDebounce(input, 'Los')

		await waitFor(() => expect(document.querySelector('.mantine-Loader-root')).toBeInTheDocument())
	})

	it('2.3: shows a no-results message, not an empty dropdown, when nothing matches', async () => {
		// The component only treats this as "no results" when the upstream Google Places API
		// itself reports ZERO_RESULTS (packages/api/schemas/thirdParty/googleGeo.ts's status
		// enum) - an empty `results` array with no `status` is NOT enough on its own to open
		// the dropdown's empty state (confirmed by first writing this mock without `status` and
		// watching the test correctly fail to find any dropdown content at all).
		autocompleteMock.mockReturnValue({
			data: { status: 'ZERO_RESULTS', results: [] },
			isFetching: false,
		} as never)
		geoByPlaceIdMock.mockReturnValue({ data: undefined } as never)
		searchNameMock.mockReturnValue({ data: undefined, isFetching: false } as never)

		render(<SearchBox type='location' loadingManager={loadingManager} />)
		const input = screen.getByRole('textbox')
		await typeAndWaitForDebounce(input, 'zzzznotarealplace')

		expect(await screen.findByText('No results found. Please try again.')).toBeInTheDocument()
	})

	it('2.7: the clear (✕) affordance empties the input once text is typed', async () => {
		autocompleteMock.mockReturnValue({ data: { results: [] }, isFetching: false } as never)
		geoByPlaceIdMock.mockReturnValue({ data: undefined } as never)
		searchNameMock.mockReturnValue({ data: undefined, isFetching: false } as never)

		render(<SearchBox type='location' loadingManager={loadingManager} />)
		const input = screen.getByRole('textbox') as HTMLInputElement
		const user = userEvent.setup()
		await user.type(input, 'Los Gatos')
		expect(input.value).toBe('Los Gatos')

		await user.click(screen.getByText('Clear'))

		expect(input.value).toBe('')
	})

	it('2.6: pressing Enter submits the top suggestion without requiring it to be highlighted first', async () => {
		autocompleteMock.mockReturnValue({
			data: {
				status: 'OK',
				results: [
					{
						value: 'Los Gatos, CA, USA',
						label: 'Los Gatos',
						subheading: 'CA, USA',
						placeId: 'place_los_gatos',
					},
				],
			},
			isFetching: false,
		} as never)
		searchNameMock.mockReturnValue({ data: undefined, isFetching: false } as never)
		// Only resolves once SearchBox has actually set `locationSearch` to this placeId (i.e.
		// after selectionHandler runs) - a mock that unconditionally returns result data would
		// fire the navigation effect on mount, before Enter is ever pressed, and the test
		// wouldn't actually be checking what Enter does.
		geoByPlaceIdMock.mockImplementation(((placeId: string) =>
			placeId === 'place_los_gatos'
				? { data: { result: { country: 'us', geometry: { location: { lng: -122.1, lat: 37.4 } } } } }
				: { data: undefined }) as never)

		render(<SearchBox type='location' loadingManager={loadingManager} />)
		const input = screen.getByRole('textbox')
		await typeAndWaitForDebounce(input, 'Los Gatos')
		// Enter submits the top suggestion, so it has to actually be there first.
		await screen.findByRole('option', { name: /Los Gatos/ })

		expect(pushMock).not.toHaveBeenCalled()
		await userEvent.setup().keyboard('{Enter}')

		expect(pushMock).toHaveBeenCalledWith(
			expect.objectContaining({
				pathname: '/search/[...params]',
				query: expect.objectContaining({ params: ['us', '-122.1', '37.4', '200', 'mi'] }),
			})
		)
	})

	it('2.8: a failed geocoding lookup shows a user-facing error, not a silent failure to navigate', async () => {
		autocompleteMock.mockReturnValue({
			data: {
				status: 'OK',
				results: [
					{
						value: 'Los Gatos, CA, USA',
						label: 'Los Gatos',
						subheading: 'CA, USA',
						placeId: 'place_los_gatos',
					},
				],
			},
			isFetching: false,
		} as never)
		searchNameMock.mockReturnValue({ data: undefined, isFetching: false } as never)
		geoByPlaceIdMock.mockReturnValue({
			data: undefined,
			isError: true,
			error: new Error('geocoding failed'),
		} as never)

		render(<SearchBox type='location' loadingManager={loadingManager} />)
		const input = screen.getByRole('textbox')
		await typeAndWaitForDebounce(input, 'Los Gatos')
		await userEvent.setup().click(await screen.findByText('Los Gatos'))

		expect(await screen.findByText(/error|try again|something went wrong/i)).toBeInTheDocument()
		expect(pushMock).not.toHaveBeenCalled()
	})
})

describe('SearchBox (organization mode)', () => {
	it('3.1: matching orgs appear, with the matched substring visually highlighted', async () => {
		autocompleteMock.mockReturnValue({ data: undefined, isFetching: false } as never)
		// packages/api/router/organization/query.searchName.handler.ts's final shape:
		// { value: name, label: name, id, slug, score } - confirmed from the handler source,
		// not assumed.
		searchNameMock.mockReturnValue({
			data: [
				{
					value: 'Whitman-Walker Health',
					label: 'Whitman-Walker Health',
					id: 'org_1',
					slug: 'whitman-walker',
					score: 1,
				},
			],
			isFetching: false,
		} as never)

		render(<SearchBox type='organization' loadingManager={loadingManager} />)
		const input = screen.getByRole('textbox')
		await typeAndWaitForDebounce(input, 'Whitman')

		expect(await screen.findByText('Whitman')).toHaveClass('_matchedText_fa3085', { exact: false })
	})

	it('3.2: no matching orgs shows a "suggest a resource" option routing to /suggest', async () => {
		autocompleteMock.mockReturnValue({ data: undefined, isFetching: false } as never)
		searchNameMock.mockReturnValue({ data: [], isFetching: false } as never)

		render(<SearchBox type='organization' loadingManager={loadingManager} />)
		const input = screen.getByRole('textbox')
		await typeAndWaitForDebounce(input, 'zzzznotarealorg')

		const suggestOption = await screen.findByText(/Suggest an organization/i)
		await userEvent.setup().click(suggestOption)

		expect(pushMock).toHaveBeenCalledWith('/suggest')
	})

	it('3.3: the dropdown does not open on bare focus, before any text is typed', async () => {
		autocompleteMock.mockReturnValue({ data: undefined, isFetching: false } as never)
		searchNameMock.mockReturnValue({ data: undefined, isFetching: false } as never)

		render(<SearchBox type='organization' loadingManager={loadingManager} />)
		const input = screen.getByRole('textbox')
		await userEvent.setup().click(input)

		expect(screen.queryByRole('option')).not.toBeInTheDocument()
	})

	it('3.4: selecting an org result navigates to /org/[slug]', async () => {
		autocompleteMock.mockReturnValue({ data: undefined, isFetching: false } as never)
		searchNameMock.mockReturnValue({
			data: [
				{
					value: 'Whitman-Walker Health',
					label: 'Whitman-Walker Health',
					id: 'org_1',
					slug: 'whitman-walker',
					score: 1,
				},
			],
			isFetching: false,
		} as never)

		render(<SearchBox type='organization' loadingManager={loadingManager} />)
		const input = screen.getByRole('textbox')
		await typeAndWaitForDebounce(input, 'Whitman')
		await userEvent.setup().click(await screen.findByRole('option', { name: 'Whitman-Walker Health' }))

		expect(pushMock).toHaveBeenCalledWith({ pathname: '/org/[slug]', query: { slug: 'whitman-walker' } })
	})

	it("3.5: does not pre-fill from a previous location search's leftover searchTerm", () => {
		autocompleteMock.mockReturnValue({ data: undefined, isFetching: false } as never)
		searchNameMock.mockReturnValue({ data: undefined, isFetching: false } as never)

		// Location mode seeds from searchState.searchTerm; org mode explicitly does not
		// (SearchBox.tsx: `isOrgSearch ? initialValue : searchState.searchTerm`). Bypasses the
		// shared test-utils render() (fixed, empty initState) to actually set a non-blank
		// searchTerm via SearchStateProvider's initState, so this genuinely exercises the guard
		// instead of just confirming an already-empty default.
		const WithLeftoverSearchTerm = ({ children }: { children: ReactNode }) => (
			<MantineProvider theme={testTheme} defaultColorScheme='light'>
				<I18nextProvider i18n={testI18n}>
					<SearchStateProvider initState={{ params: [], searchTerm: 'Los Gatos' }}>
						{children}
					</SearchStateProvider>
				</I18nextProvider>
			</MantineProvider>
		)
		rtlRender(<SearchBox type='organization' loadingManager={loadingManager} />, {
			wrapper: WithLeftoverSearchTerm,
		})
		const input = screen.getByRole('textbox') as HTMLInputElement

		expect(input.value).toBe('')
	})
})
