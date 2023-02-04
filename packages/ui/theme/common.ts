import { MantineThemeOverride } from '@mantine/core'

import { customColors } from './colors'

export const commonTheme: MantineThemeOverride = {
	colorScheme: 'light',
	colors: { ...customColors },
	primaryColor: 'inReachPrimaryRegular',
	primaryShade: 5,
	cursorType: 'pointer',
	lineHeight: 1.5,
	fontFamily:
		'Work Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
	fontSizes: {
		xs: 12,
		sm: 14,
		md: 16,
		lg: 18,
		xl: 20,
	},
	shadows: {
		xs: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
		sm: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 10px 15px -5px, rgba(0, 0, 0, 0.04) 0px 7px 7px -5px',
		md: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px',
		lg: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 28px 23px -7px, rgba(0, 0, 0, 0.04) 0px 12px 12px -7px',
		xl: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 36px 28px -7px, rgba(0, 0, 0, 0.04) 0px 17px 17px -7px',
	},

	radius: {
		xs: 2,
		sm: 4,
		md: 8,
		lg: 16,
		xl: 32,
	},

	spacing: {
		xs: 10,
		sm: 12,
		md: 16,
		lg: 20,
		xl: 24,
	},

	breakpoints: {
		xs: 500,
		sm: 768,
		md: 1024,
		lg: 1200,
		xl: 1440,
	},
	headings: {
		fontFamily:
			'Work Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
		fontWeight: 500,
		sizes: {
			h1: { fontSize: 40, lineHeight: 1.25, fontWeight: undefined },
			h2: { fontSize: 24, lineHeight: 1.25, fontWeight: undefined },
			h3: { fontSize: 16, lineHeight: 1.25, fontWeight: 600 },
			h4: { fontSize: 16, lineHeight: 1.25, fontWeight: 600 },
			h5: { fontSize: 16, lineHeight: 1.25, fontWeight: 600 },
			h6: { fontSize: 16, lineHeight: 1.25, fontWeight: 600 },
		},
	},
	other: {
		/** Font weights per InReach style guide */
		fontWeight: {
			regular: 400,
			semibold: 500,
			bold: 600,
		},
		border: {
			default: '1px solid #d9d9d9',
		},
		colors: {
			primary: {
				lightGray: '#EFEFEF',
				allyGreen: '#00D56C',
			},
			secondary: {
				black: '#000000',
				white: '#FFFFFF',
				darkGray: '#65676B',
				teal: '#28939C',
				cornflower: '#4792DA',
				softBlack: '#21272C',
			},
			tertiary: {
				coolGray: '#d9d9d9',
				red: '#C05C4A',
				pink: '#D4A1BA',
				lightBlue: '#79ADD7',
				purple: '#705890',
				darkBlue: '#3c4e8f',
				green: '#749C66',
				yellow: '#F1DD7F',
				orange: '#c77e54',
				brown: '#5d4830',
				darkBrown: '#322f2e',
			},
		},
	},
	components: {
		ActionIcon: {
			defaultProps: (theme) => ({
				color: theme.other.colors.secondary.cornflower,
				radius: 'xl',
			}),
		},
		Avatar: {
			defaultProps: {
				size: 48,
				radius: 'xl',
			},
		},
		Badge: {
			defaultProps: {
				radius: 'xl',
			},
		},
		Button: {
			defaultProps: {
				radius: 'xl',
			},
		},
		GridCol: {
			defaultProps: {
				span: 12,
				xs: 6,
				sm: 4,
			},
		},
		Text: {
			defaultProps: (theme) => ({
				component: 'span',
				weight: theme.other.fontWeight.regular,
				color: theme.other.colors.secondary.black,
				size: 'md',
			}),
		},
		Title: {
			styles: {
				root: {
					marginTop: 0,
				},
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
			default: '1px solid #d9d9d9'
		}
		colors: {
			primary: {
				lightGray: '#EFEFEF'
				allyGreen: '#00D56C'
			}
			secondary: {
				black: '#000000'
				white: '#FFFFFF'
				darkGray: '#65676B'
				teal: '#28939C'
				cornflower: '#4792DA'
				softBlack: '#21272C'
			}
			tertiary: {
				coolGray: '#d9d9d9'
				red: '#C05C4A'
				pink: '#D4A1BA'
				lightBlue: '#79ADD7'
				purple: '#705890'
				darkBlue: '#3c4e8f'
				green: '#749C66'
				yellow: '#F1DD7F'
				orange: '#c77e54'
				brown: '#5d4830'
				darkBrown: '#322f2e'
			}
		}
	}
}
