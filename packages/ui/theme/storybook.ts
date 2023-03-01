import { type MantineThemeOverride } from '@mantine/core'

import { commonTheme } from './common'

export const storybookTheme: MantineThemeOverride = {
	...commonTheme,
	fontFamily: 'Work Sans',
}
