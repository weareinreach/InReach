// import { Open_Sans } from '@next/font/google'
import { MantineThemeOverride } from '@mantine/core'

import { commonTheme } from './common'

// const openSans = Open_Sans({ subsets: ['latin'] })

export const appTheme: MantineThemeOverride = {
	...commonTheme,
	// fontFamily: openSans.style.fontFamily,
}
