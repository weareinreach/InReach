import { MantineThemeOverride } from '@mantine/core'

import { customColors } from './colors'

export const commonTheme: MantineThemeOverride = {
	colorScheme: 'light',
	colors: { ...customColors },
	primaryColor: 'inReachPrimaryRegular',
	primaryShade: 5,
	fontFamily:
		'Work Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
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
			defaultProps: {
				color: 'inReachSecondaryRegular.5',
			},
		},
		Avatar: {
			defaultProps: {
				size: 48,
				radius: 'xl',
			},
		},
		Badge: {
			defaultProps: {
				radius: '100px',
			},
		},
		Button: {
			defaultProps: {
				radius: 'xl',
			},
		},
		Text: {
			defaultProps: {
				component: 'span',
				weight: 400,
			},
			styles: {
				root: {
					lineHeight: 1.5,
				},
			},
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
