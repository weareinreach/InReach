import { MantineProvider } from '@mantine/core'
import { render as rtlRender } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { describe, expect, it, vi } from 'vitest'

import { testI18n } from '~ui/test/i18nTestInstance'
import { screen } from '~ui/test/test-utils'
import { storybookTheme } from '~ui/theme/storybook'

import { Pagination } from './Pagination'

const routerQuery = vi.hoisted(() => {
	const initial: Record<string, string> = {}
	return { current: initial }
})
vi.mock('next/router', () => ({
	useRouter: () => ({ query: routerQuery.current, replace: vi.fn() }),
}))

const renderPagination = (total: number, page = '1') => {
	routerQuery.current = { page }
	return rtlRender(
		<MantineProvider theme={storybookTheme} defaultColorScheme='light'>
			<I18nextProvider i18n={testI18n}>
				<Pagination total={total} />
			</I18nextProvider>
		</MantineProvider>
	)
}

describe('Pagination', () => {
	it('11.1: shows the correct total page count when more results exist than fit on one page', () => {
		renderPagination(8, '1')

		// Boundaries=1, siblings=1 (Pagination.tsx) - range for total=8, active=1 is [1,2,'dots',8].
		expect(screen.getByText('1')).toBeInTheDocument()
		expect(screen.getByText('2')).toBeInTheDocument()
		expect(screen.getByText('8')).toBeInTheDocument()
		expect(screen.getByText('...')).toBeInTheDocument()
	})

	it("11.4: fewer results than one page's worth (total=1) still renders the control, not hidden", () => {
		// apps/app/src/utils/constants.ts: getSearchResultPageCount(results) =
		// Math.ceil(results / SEARCH_RESULT_PAGE_SIZE) - any resultCount from 1-10 (page size 10)
		// produces total=1, and the real page passes this straight to <Pagination> with no `total >
		// 1` guard around it. Correctly documents actual behavior: Pagination.tsx has no internal
		// check either, so a single-page result set still renders a full, visible control (just
		// page "1", both Prev and Next inert) rather than disappearing.
		renderPagination(1, '1')

		expect(screen.getByText('1')).toBeVisible()
		expect(screen.getByText('Prev')).toBeVisible()
		expect(screen.getByText('Next')).toBeVisible()
	})
})
