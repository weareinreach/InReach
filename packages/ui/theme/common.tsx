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
	StackProps,
	CheckboxStylesNames,
	CheckboxStylesParams,
	CheckboxProps,
	RadioStylesNames,
	RadioStylesParams,
	SwitchProps,
	SwitchStylesNames,
	SwitchStylesParams,
	SwitchGroupProps,
	TextareaProps,
} from '@mantine/core'

import { Icon } from '~ui/icon'

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
				size: 'xl',
			} satisfies BadgeProps,
			styles: (theme) =>
				({
					root: {
						letterSpacing: 'inherit',
						border: '1px solid',
						paddingLeft: theme.spacing.sm,
						paddingRight: theme.spacing.sm,
						textTransform: 'none',
					},
					inner: {
						fontWeight: theme.other.fontWeight.semibold,
						color: theme.other.colors.secondary.black,
					},
					leftSection: {
						margin: 0,
					},
				} satisfies Styles<BadgeStylesNames, BadgeStylesParams>),
		},
		Button: {
			defaultProps: {
				radius: 'xl',
			} satisfies ButtonProps,
			styles: (theme) => ({
				root: {
					padding: theme.spacing.sm / 2,
					paddingLeft: theme.spacing.xl * 2,
					paddingRight: theme.spacing.xl * 2,
					height: theme.spacing.xl * 2,
					backgroundColor: theme.other.colors.secondary.black,
					'&:hover': {
						background: theme.fn.lighten(theme.other.colors.secondary.black, 0.4),
					},
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
					...theme.other.utilityFonts.utility1,
					color: theme.other.colors.secondary.white,
					'&:disabled, &[data-disabled]': {
						color: theme.other.colors.secondary.darkGray,
					},
				},
				leftIcon: {
					svg: {
						height: theme.spacing.xl,
						width: theme.spacing.xl,
					},
				},
			}),
		},
		Checkbox: {
			styles: (theme, params: CheckboxStylesParams) =>
				({
					root: {
						padding: '8px 0 8px 4px',
						'&:hover': {
							backgroundColor: theme.other.colors.primary.lightGray,
						},
					},
					label: {
						...theme.other.utilityFonts.utility2,
						paddingLeft: theme.spacing.xs,
						'&:disabled': {
							color: theme.other.colors.secondary.darkGray,
						},
					},
					labelWrapper: {
						justifyContent: 'center',
					},
					input: {
						borderColor: theme.other.colors.tertiary.coolGray,
						height: theme.spacing.xl,
						width: theme.spacing.xl,
						'&:checked': {
							backgroundColor: params.indeterminate
								? theme.other.colors.secondary.white
								: theme.other.colors.secondary.black,
							color: params.indeterminate
								? theme.other.colors.secondary.black
								: theme.other.colors.secondary.white,
						},
						'&:disabled': {
							backgroundColor: theme.other.colors.primary.lightGray,
						},
					},
					inner: {
						height: 24,
						width: 24,
					},
					icon: {
						width: params.indeterminate ? '12px' : '14px',
						height: params.indeterminate ? '3px' : '10.5px',
						margin: params.indeterminate ? '10.5px 6px' : '6.75px 5px',
					},
				} satisfies Styles<CheckboxStylesNames, CheckboxStylesParams>),
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
						padding: '0px !important',
						[theme.fn.largerThan('sm')]: {
							maxHeight: 800,
						},
					},
					header: {
						margin: 0,
						padding: '16px 8px 16px 12px',
						borderBottom: '1px',
						borderBottomStyle: 'solid',
						borderColor: theme.other.colors.primary.lightGray,
						[theme.fn.largerThan('xs')]: {
							padding: '16px 20px 16px 24px',
						},
					},
					body: {
						padding: '20px',
						[theme.fn.largerThan('xs')]: {
							padding: ['20px', '32px', '20px', '32px'],
						},
						[theme.fn.largerThan('sm')]: {
							padding: ['40px', '32px'],
						},
					},
					title: {
						margin: 0,
					},
				} satisfies Styles<ModalStylesNames, ModalStylesParams>),
		},
		Radio: {
			styles: (theme) =>
				({
					root: {
						padding: '10px 0 10px 2px',
						'&:hover': {
							backgroundColor: theme.other.colors.primary.lightGray,
						},
					},
					label: {
						...theme.other.utilityFonts.utility2,
					},
					radio: {
						backgroundColor: theme.other.colors.secondary.white,
						borderColor: theme.other.colors.secondary.black,
						color: theme.other.colors.secondary.black,
						borderWidth: 2,
						'&:checked': {
							background: theme.other.colors.secondary.black,
							borderColor: theme.other.colors.secondary.black,
						},
						'&:disabled': {
							backgroundColor: theme.other.colors.primary.lightGray,
						},
					},
				} satisfies Styles<RadioStylesNames, RadioStylesParams>),
		},
		Rating: {
			defaultProps: (theme) => ({
				emptySymbol: (
					<Icon icon='carbon:star-filled' color={theme.other.colors.tertiary.coolGray} height={24} />
				),
				fullSymbol: <Icon icon='carbon:star-filled' color={theme.other.colors.secondary.black} height={24} />,
			}),
			styles: (theme) => ({
				root: {
					columnGap: '4px',
				},
			}),
		},
		Skeleton: {
			defaultProps: (theme) =>
				({
					height: theme.fontSizes.md,
				} satisfies SkeletonProps),
		},
		Switch: {
			defaultProps: {
				labelPosition: 'left',
			} satisfies SwitchProps,
			styles: (theme) =>
				({
					root: {
						padding: '12px 0 12px 0px',
						'&:hover': {
							backgroundColor: theme.other.colors.primary.lightGray,
						},
					},
					body: {
						justifyContent: 'space-between',
					},
					label: {
						...theme.other.utilityFonts.utility2,
						'input:disabled + &': {
							color: theme.other.colors.secondary.darkGray,
							borderColor: theme.other.colors.secondary.darkGray,
						},
					},
					track: {
						height: 16,
						width: 48,
						backgroundColor: theme.other.colors.tertiary.coolGray,
						overflow: 'inherit',
						'input:checked + &': {
							backgroundColor: theme.other.colors.tertiary.coolGray,
							borderColor: theme.other.colors.tertiary.coolGray,
						},
					},
					thumb: {
						left: 0,
						height: 24,
						width: 24,
						borderWidth: 0.5,
						borderColor: theme.fn.darken(theme.other.colors.secondary.white, 0.04),
						boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.15), 0px 3px 1px rgba(0, 0, 0, 0.06)',
						'input:checked + * > &': {
							backgroundColor: theme.other.colors.secondary.black,
							borderColor: theme.fn.darken(theme.other.colors.secondary.black, 0.04),
						},
						'input:disabled + * > &': {
							backgroundColor: theme.other.colors.primary.lightGray,
							borderColor: theme.other.colors.primary.lightGray,
						},
					},
				} satisfies Styles<SwitchStylesNames, SwitchStylesParams>),
		},
		SwitchGroup: {
			defaultProps: {
				orientation: 'vertical',
			} satisfies Partial<SwitchGroupProps>,
		},
		Stack: {
			defaultProps: {
				spacing: 'md',
			} satisfies StackProps,
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
		Textarea: {
			defaultProps: {
				radius: 'md',
				autosize: true,
				minRows: 3,
				maxRows: 5,
			} satisfies TextareaProps,
			styles: (theme) => ({
				label: {
					paddingBottom: 10,
				},
				input: {
					padding: '14px 16px',
					borderColor: theme.other.colors.tertiary.coolGray,

					...theme.other.utilityFonts.utility2,
					'&::placeholder': {
						color: theme.other.colors.secondary.darkGray,
					},
					'&:focus, &:focus-within': {
						borderColor: theme.other.colors.secondary.black,
						borderWidth: '2px',
					},
				},
				invalid: {
					'&::placeholder': {
						color: theme.other.colors.secondary.darkGray,
					},
					'&:focus, &:focus-within': {
						color: theme.other.colors.secondary.black,
						borderColor: theme.other.colors.tertiary.red,
						borderWidth: '2px',
					},
				},
				wrapper: { height: '96px' },
			}),
		},
		TextInput: {
			styles: (theme) => ({
				label: {
					paddingBottom: 10,
				},
				input: {
					padding: '14px 16px',
					borderColor: theme.other.colors.tertiary.coolGray,

					...theme.other.utilityFonts.utility2,
					'&::placeholder': {
						color: theme.other.colors.secondary.darkGray,
					},
					'&:focus, &:focus-within': {
						borderColor: theme.other.colors.secondary.black,
						borderWidth: '2px',
					},
				},
				icon: {
					color: theme.other.colors.secondary.black,
					marginLeft: theme.spacing.md,
					width: 'fit-content',
				},
				withIcon: {
					borderRadius: theme.radius.xl,
					paddingLeft: '44px',
				},
				rightSection: {
					paddingRight: theme.spacing.md,
				},
				invalid: {
					'&::placeholder': {
						color: theme.other.colors.secondary.darkGray,
					},
					'&:focus, &:focus-within': {
						color: theme.other.colors.secondary.black,
						borderColor: theme.other.colors.tertiary.red,
						borderWidth: '2px',
					},
				},
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
		Tooltip: {
			defaultProps: {
				offset: 10,
				position: 'top-start',
			},
			styles: (theme) => ({
				tooltip: {
					boxShadow: theme.shadows.xs,
				},
			}),
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
