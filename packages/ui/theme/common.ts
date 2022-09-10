import type { MantineThemeOverride } from '@mantine/core'

export const commonTheme: MantineThemeOverride = {
	colorScheme: 'light',
	colors: {
		primary: [
			'#f2fcf8',
			'#e6f9f0',
			'#bff1db',
			'#99e8c5',
			'#4dd699',
			'#00c56d', // index 5 - Primary color
			'#00b162',
			'#009452',
			'#007641',
			'#006135',
		],
	},
	primaryColor: 'primary',
	primaryShade: 5,
}
