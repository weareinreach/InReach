import { MantineProvider } from '@mantine/core'
import { render as rtlRender } from '@testing-library/react'
import { type ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { describe, expect, it, vi } from 'vitest'

import { SearchStateProvider } from '~ui/providers/SearchState'
import { testI18n } from '~ui/test/i18nTestInstance'
import { screen } from '~ui/test/test-utils'
import { storybookTheme } from '~ui/theme/storybook'

import { SortResults } from './SortResults'

vi.mock('next/router', () => ({
	useRouter: () => ({ locale: 'en', query: {}, push: vi.fn(), replace: vi.fn() }),
}))

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		organization: {
			getCommunityFocusOptions: { useQuery: vi.fn(() => ({ data: [], isLoading: false })) },
			searchName: { useQuery: vi.fn(() => ({ data: undefined })) },
		},
		geo: {
			autocomplete: { useQuery: vi.fn(() => ({ data: undefined })) },
			geoByPlaceId: { useQuery: vi.fn(() => ({ data: undefined })) },
		},
	},
}))

const loadingManager = { isLoading: false, setLoading: vi.fn() }

const renderSortResults = (props: Partial<Parameters<typeof SortResults>[0]> = {}) => {
	const Wrapper = ({ children }: { children: ReactNode }) => (
		<MantineProvider theme={storybookTheme} defaultColorScheme='light'>
			<I18nextProvider i18n={testI18n}>
				<SearchStateProvider initState={{ params: [] }}>{children}</SearchStateProvider>
			</I18nextProvider>
		</MantineProvider>
	)
	return rtlRender(
		<SortResults resultCount={10} loadingManager={loadingManager} {...props}>
			Sort results
		</SortResults>,
		{ wrapper: Wrapper }
	)
}

describe('SortResults', () => {
	it("10.3: resultCount === 0 alone does not disable the button - the component trusts its caller's explicit `disabled` prop", () => {
		// SortResults.tsx has no internal `resultCount === 0` check of its own - `disabled` is a
		// plain passthrough prop. Confirmed by reading the component: the inventory's expected
		// behavior ("resultCount === 0 -> Button is disabled") only actually holds wherever the
		// *caller* remembers to pass `disabled={resultCount === 0}\` itself.
		renderSortResults({ resultCount: 0 })

		expect(screen.getByRole('button', { name: 'Sort results' })).not.toBeDisabled()
	})

	it('10.3b: a caller that passes disabled={true} does disable the button', () => {
		renderSortResults({ resultCount: 0, disabled: true })

		expect(screen.getByRole('button', { name: 'Sort results' })).toBeDisabled()
	})
})
