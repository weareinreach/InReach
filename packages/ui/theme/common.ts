import {
	type ModalStylesNames,
	type ModalStylesParams,
	type ActionIconProps,
	type AvatarProps,
	type BadgeProps,
	type ButtonProps,
	type ColProps,
	type DefaultProps,
	type MantineThemeOther,
	type MantineThemeOverride,
	type Styles,
	type TabsStylesNames,
	type TabsStylesParams,
	type TitleStylesParams,
	type TypographyStylesProviderProps,
	type BadgeStylesNames,
	type BadgeStylesParams,
	type SkeletonProps,
} from '@mantine/core'

import { customColors } from './colors'

import type React from 'react'

const colors = {
	primary: {
		lightGray: '#EFEFEF',
		allyGreen: '#00D56C',
	},
	secondary: {
		black: '#21272C',
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
} as const

const themeCustomObj = {
	/** Font weights per InReach style guide */
	fontWeight: {
		regular: 400,
		semibold: 500,
		bold: 600,
	},
	/** Utility font definitions */
	utilityFonts: {
		utility1: {
			fontSize: 16,
			fontWeight: 500,
			lineHeight: 1.25,
			color: colors.secondary.black,
		},
		utility2: {
			fontSize: 16,
			fontWeight: 400,
			lineHeight: 1.25,
			color: colors.secondary.black,
		},
		utility3: {
			fontSize: 14,
			fontWeight: 500,
			lineHeight: 1.25,
			color: colors.secondary.black,
		},
		utility4: {
			fontSize: 14,
			fontWeight: 400,
			lineHeight: 1.25,
			color: colors.secondary.black,
		},
	},
	border: {
		default: '1px solid #d9d9d9',
	},
	colors,
} as const satisfies MantineThemeOther

export const commonTheme = {
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
		xs: '0px 4px 20px rgba(0, 0, 0, 0.1)',
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
		xs: 8,
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
	other: themeCustomObj,
	components: {
		ActionIcon: {
			defaultProps: (theme) =>
				({
					color: theme.other.colors.secondary.cornflower,
					radius: 'xl',
				} satisfies ActionIconProps),
		},
		Avatar: {
			defaultProps: {
				size: 48,
				radius: 'xl',
			} satisfies AvatarProps,
		},
		Badge: {
			defaultProps: {
				radius: 'xl',
			} satisfies BadgeProps,
			styles: (theme) =>
				({
					root: {
						letterSpacing: 'inherit',
					},
				} satisfies Styles<BadgeStylesNames, BadgeStylesParams>),
		},
		Button: {
			defaultProps: {
				radius: 'xl',
			} satisfies ButtonProps,
			styles: (theme) => ({
				root: {
					'&:disabled, &[data-disabled]': {
						backgroundColor: theme.other.colors.primary.lightGray,
						cursor: 'not-allowed',
						pointerEvents: 'none',
						'& *': {
							color: theme.other.colors.secondary.darkGray,
						},

						'&:active': {
							transform: 'none',
						},
					},
				},
				inner: {
					'&:disabled, &[data-disabled]': {
						color: theme.other.colors.secondary.darkGray,
					},
				},
			}),
		},
		GridCol: {
			defaultProps: {
				span: 12,
				xs: 6,
				sm: 4,
			} satisfies ColProps,
		},
		Modal: {
			styles: (theme) =>
				({
					modal: {
						[theme.fn.largerThan('sm')]: {
							maxHeight: 800,
						},
					},
					inner: {
						margin: [20, 20],
						[theme.fn.largerThan('xs')]: {
							margin: [20, 32],
						},
						[theme.fn.largerThan('sm')]: {
							margin: [40, 32],
						},
					},
				} satisfies Styles<ModalStylesNames, ModalStylesParams>),
		},
		Skeleton: {
			defaultProps: (theme) =>
				({
					height: theme.fontSizes.md,
				} satisfies SkeletonProps),
		},
		Tabs: {
			styles: (theme) =>
				({
					tab: {
						padding: [`16px`, `24px`],
						'&[data-active]': {
							borderColor: theme.other.colors.secondary.black,
						},
						'&[data-active]:hover': {
							borderColor: theme.other.colors.secondary.black,
						},
					},
					tabLabel: {
						...theme.other.utilityFonts.utility1,
					},
				} satisfies Styles<TabsStylesNames, TabsStylesParams>),
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
			styles: (theme) =>
				({
					root: {
						'&:is(h1)': {
							marginTop: 0,
							[theme.fn.smallerThan(755)]: {
								fontSize: theme.headings.sizes.h1.fontSize,
							},
						},
						'&:is(h2)': {
							marginTop: 0,
							[theme.fn.smallerThan(755)]: {
								fontSize: theme.headings.sizes.h2.fontSize,
							},
						},
						'&:is(h3)': {
							marginTop: 0,
							[theme.fn.smallerThan(755)]: {
								fontSize: theme.headings.sizes.h3.fontSize,
							},
						},
						'&:is(h4)': {
							marginTop: 0,
							[theme.fn.smallerThan(755)]: {
								fontSize: theme.headings.sizes.h4.fontSize,
							},
						},
						'&:is(h5)': {
							marginTop: 0,
							[theme.fn.smallerThan(755)]: {
								fontSize: theme.headings.sizes.h5.fontSize,
							},
						},
						'&:is(h6)': {
							marginTop: 0,
							[theme.fn.smallerThan(755)]: {
								fontSize: theme.headings.sizes.h6.fontSize,
							},
						},
					},
				} satisfies Styles<'root', TitleStylesParams>),
		},
		TypographyStylesProvider: {
			styles: (theme) =>
				({
					root: {
						'& p': {
							marginBottom: 0,
							'@media (max-width: 755px)': {
								fontSize: theme.fontSizes.md,
							},
						},
					},
				} satisfies Styles<'root', TypographyStylesProviderProps>),
		},
	},
} satisfies MantineThemeOverride

type ThemeCustomObject = typeof themeCustomObj
declare module '@mantine/core' {
	export interface MantineThemeOther extends ThemeCustomObject {}
}
