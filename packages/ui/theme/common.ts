import { merge } from 'merge-anything'

import { ButtonStylesParams, MantineThemeOverride } from '@mantine/core'

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
			semibold: 500,
			bold: 600,
		},
		border: {
			default: '1px solid',
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
		// a: {
		// 	fontWeight: theme.other.fontWeight.semibold,
		// 	color: theme.colors.inReachSecondaryRegular[5],
		// 	textDecoration: 'none',
		// },
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
						position: 'absolute',
						display: 'flex',
						top: theme.spacing.lg,
						padding: theme.spacing.sm / 2,
						paddingLeft: theme.spacing.xl * 2,
						paddingRight: theme.spacing.xl * 2,
						height: theme.spacing.xl * 2,
						gap: theme.spacing.sm,
						backgroundColor: theme.other.colors.secondary.black,
						'&:hover': {
							background: theme.fn.lighten(theme.other.colors.secondary.black, 0.4),
						},
					},
					inner: {
						color: theme.other.colors.secondary.white,
					},
					leftIcon: {
						svg: {
							height: theme.spacing.lg,
							width: theme.spacing.lg,
						},
					},
					label: {
						fontSize: theme.spacing.md,
						fontWeight: theme.other.fontWeight.semibold,
						height: 'auto',
						width: 'auto',
						lineHeight: `${theme.spacing.lg}px`,
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
			semibold: 500
			bold: 600
		}
		border: {
			default: '1px solid'
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
