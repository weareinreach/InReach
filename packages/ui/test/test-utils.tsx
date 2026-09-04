import { MantineProvider } from '@mantine/core'
import { render, type RenderOptions } from '@testing-library/react'
import { type ReactElement, type ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'

import { SearchStateProvider } from '~ui/providers/SearchState'
import { storybookTheme } from '~ui/theme/storybook'

import { testI18n } from './i18nTestInstance'

const Providers = ({ children }: { children: ReactNode }) => (
	<MantineProvider theme={storybookTheme} defaultColorScheme='light'>
		<I18nextProvider i18n={testI18n}>
			{/* Breadcrumb (used by ModalTitle and elsewhere) reads this context unconditionally -
			    real, self-contained provider, not worth mocking per-test. */}
			<SearchStateProvider initState={{ params: [] }}>{children}</SearchStateProvider>
		</I18nextProvider>
	</MantineProvider>
)

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
	render(ui, { wrapper: Providers, ...options })

export * from '@testing-library/react'
export { customRender as render }
