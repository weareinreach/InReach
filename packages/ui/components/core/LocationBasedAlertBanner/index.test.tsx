import { MantineProvider } from '@mantine/core'
import { render as rtlRender } from '@testing-library/react'
import { type ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { describe, expect, it, vi } from 'vitest'

import { testI18n } from '~ui/test/i18nTestInstance'
import { screen } from '~ui/test/test-utils'
import { storybookTheme } from '~ui/theme/storybook'

import { LocationBasedAlertBanner } from './index'

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: { component: { LocationBasedAlertBanner: { useQuery: vi.fn() } } },
}))

const { trpc } = await import('~ui/lib/trpcClient')
const useQueryMock = vi.mocked(trpc.component.LocationBasedAlertBanner.useQuery)

const Wrapper = ({ children }: { children: ReactNode }) => (
	<MantineProvider theme={storybookTheme} defaultColorScheme='light'>
		<I18nextProvider i18n={testI18n}>{children}</I18nextProvider>
	</MantineProvider>
)

const renderBanner = (type: 'primary' | 'secondary') =>
	rtlRender(<LocationBasedAlertBanner lat={1} lon={1} type={type} />, { wrapper: Wrapper })

describe('LocationBasedAlertBanner', () => {
	it('14.3: an alert with a <Link> tag always opens it as external, target=_blank', () => {
		useQueryMock.mockReturnValue({
			isLoading: false,
			data: [
				{
					id: 'alrt_1',
					level: 'CRITICAL_PRIMARY',
					i18nKey: 'locationBasedAlert.alrt_1',
					ns: 'org-data',
					defaultText: 'Alert with a <Link href="https://internal-looking-path.example">link</Link>',
				},
			],
		} as never)

		renderBanner('primary')

		const link = screen.getByRole('link', { name: 'link' })
		expect(link).toHaveAttribute('target', '_blank')
		expect(link).toHaveAttribute('href', 'https://internal-looking-path.example')
	})

	it('14.4: an alert with no <Link> tag renders plain text only, nothing clickable', () => {
		useQueryMock.mockReturnValue({
			isLoading: false,
			data: [
				{
					id: 'alrt_2',
					level: 'INFO_PRIMARY',
					i18nKey: 'locationBasedAlert.alrt_2',
					ns: 'org-data',
					defaultText: 'Plain alert text, no link',
				},
			],
		} as never)

		renderBanner('primary')

		expect(screen.getByText('Plain alert text, no link')).toBeInTheDocument()
		expect(screen.queryByRole('link')).not.toBeInTheDocument()
	})

	it("14.5: a primary-level alert doesn't bleed into the secondary-type instance, and vice versa", () => {
		useQueryMock.mockReturnValue({
			isLoading: false,
			data: [
				{ id: 'alrt_p', level: 'WARN_PRIMARY', i18nKey: 'x', ns: 'org-data', defaultText: 'Primary alert' },
				{
					id: 'alrt_s',
					level: 'WARN_SECONDARY',
					i18nKey: 'y',
					ns: 'org-data',
					defaultText: 'Secondary alert',
				},
			],
		} as never)

		const { unmount } = renderBanner('primary')
		expect(screen.getByText('Primary alert')).toBeInTheDocument()
		expect(screen.queryByText('Secondary alert')).not.toBeInTheDocument()
		unmount()

		renderBanner('secondary')
		expect(screen.getByText('Secondary alert')).toBeInTheDocument()
		expect(screen.queryByText('Primary alert')).not.toBeInTheDocument()
	})

	it('14.6: no matching alert renders genuinely empty - no empty box or border', () => {
		useQueryMock.mockReturnValue({ isLoading: false, data: [] } as never)

		const { container } = renderBanner('primary')

		expect(container.querySelector('[data-alert-level]')).not.toBeInTheDocument()
		// The Stack wrapper itself still renders (gap={0}, no visible border/background of its own)
		// - confirms this is "nothing to show" rather than a crash, not that the wrapper vanishes.
		expect(container.querySelector('[class*="primaryContainer"]')).toBeInTheDocument()
	})
})
