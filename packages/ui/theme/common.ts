import { merge } from 'merge-anything'

import type { ButtonStylesParams, MantineThemeOverride } from '@mantine/core'

import { customColors } from './colors'
import { buttonVariants } from './functions'

export const commonTheme: MantineThemeOverride = {
	colorScheme: 'light',
	colors: { ...customColors },
	primaryColor: 'inReachPrimaryRegular',
	primaryShade: 5,
	other: {
		/** Font weights per InReach style guide */
		fontWeight: {
			regular: 400,
			semibold: 600,
			bold: 700,
			extrabold: 800,
		},
	},
	globalStyles: (theme) => ({
		a: {
			fontWeight: theme.other.fontWeight.semibold,
			color: theme.colors.inReachSecondaryRegular[5],
			textDecoration: 'none',
		},
	}),
	components: {
		ActionIcon: {
			defaultProps: {
				color: 'inReachSecondaryRegular.5',
			},
		},
		Button: {
			defaultProps: {
				radius: 'xl',
			},
			styles: (theme, params: ButtonStylesParams) => {
				const baseStyle = {
					inner: {
						color: theme.colors.primaryText[9],
						fontWeight: theme.other.fontWeight.bold,
						textTransform: 'uppercase',
					},
				}

				return merge(baseStyle, buttonVariants(theme, params))
			},
		},
	},
}

// Type Definitions for `other` object

declare module '@mantine/core' {
	export interface MantineThemeOther {
		/** Font weights per InReach Style Guide */
		fontWeight: {
			regular: 400
			semibold: 600
			bold: 700
			extrabold: 800
		}
	}
}
