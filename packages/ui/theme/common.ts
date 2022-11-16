import type { ButtonStylesParams, MantineThemeOverride } from '@mantine/core'

import { customColors } from './colors'
import { buttonVariants } from './functions'

export const commonTheme: MantineThemeOverride = {
	colorScheme: 'light',
	colors: { ...customColors },
	primaryColor: 'inReachGreen',
	primaryShade: 5,
	other: {},
	components: {
		Button: {
			defaultProps: {
				radius: 'xl',
			},
			styles: (theme, params: ButtonStylesParams) => buttonVariants(theme, params),
		},
	},
}
