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
		colors: {
			primary: {
				lightGray: '#EFEFEF',
			},
			secondary: {
				black: '#000000',
				white: '#FFFFFF',
			},
			tertiary: {
				coolGray: '#d9d9d9',
				red: '#C05C4A',
			},
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
					root: {
						top: '20px',
						width: 'hug',
					},
					inner: {
						color: theme.colors.primaryText[9],
					},
					leftIcon: {
						svg: {
							height: theme.spacing.lg,
							width: theme.spacing.lg,
						},
					},
					label: {
						fontWeight: theme.other.fontWeight.semibold,
						width: 'hug',
						height: 'hug',
						top: '14px',
						left: '80px',
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
		colors: {
			primary: {
				lightGray: '#EFEFEF'
			}
			secondary: {
				white: '#FFFFFF'
				black: '#000000'
			}
			tertiary: {
				coolGray: '#d9d9d9'
				red: '#C05C4A'
			}
		}
	}
}
