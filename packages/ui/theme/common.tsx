/* eslint-disable import/consistent-type-specifier-style */
import {
	type ActionIconProps,
	type AvatarProps,
	type BadgeProps,
	type BadgeStylesNames,
	type BadgeStylesParams,
	type ButtonProps,
	type CardProps,
	type CheckboxStylesNames,
	type CheckboxStylesParams,
	type ColProps,
	type CSSObject,
	type DrawerStylesNames,
	em,
	type GridProps,
	type InputStylesNames,
	type InputStylesParams,
	type InputWrapperBaseProps,
	type InputWrapperProps,
	type InputWrapperStylesNames,
	type MantineThemeOther,
	type MantineThemeOverride,
	type ModalProps,
	type ModalStylesNames,
	type RadioStylesNames,
	type RadioStylesParams,
	rem,
	type SkeletonProps,
	type SkeletonStylesParams,
	type SliderProps,
	type SliderStylesNames,
	type StackProps,
	type Styles,
	type SwitchProps,
	type SwitchStylesNames,
	type SwitchStylesParams,
	type TabsStylesNames,
	type TabsStylesParams,
	type TextareaProps,
	type TitleStylesParams,
	type TypographyStylesProviderProps,
} from '@mantine/core'
import { keys } from '@mantine/utils'
import React from 'react'

import { Icon } from '~ui/icon'

import { shake } from './animation'
import { customColors } from './colors'
import { variants } from './variants'

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
		footer: '#F7F7F7',
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
			fontSize: rem(16),
			fontWeight: 500,
			lineHeight: 1.25,
			color: colors.secondary.black,
		},
		utility2: {
			fontSize: rem(16),
			fontWeight: 400,
			lineHeight: 1.25,
			color: colors.secondary.black,
		},
		utility3: {
			fontSize: rem(14),
			fontWeight: 500,
			lineHeight: 1.25,
			color: colors.secondary.black,
		},
		utility4: {
			fontSize: rem(14),
			fontWeight: 400,
			lineHeight: 1.25,
			color: colors.secondary.black,
		},
	},
	headings: {
		h1: { fontSize: rem(40), lineHeight: 1.25, fontWeight: 500 },
		h2: { fontSize: rem(24), lineHeight: 1.25, fontWeight: 500 },
		h3: { fontSize: rem(16), lineHeight: 1.25, fontWeight: 600 },
		h4: { fontSize: rem(16), lineHeight: 1.25, fontWeight: 600 },
		h5: { fontSize: rem(16), lineHeight: 1.25, fontWeight: 600 },
		h6: { fontSize: rem(16), lineHeight: 1.25, fontWeight: 600 },
	},
	border: {
		default: '1px solid #d9d9d9',
	},
	colors,
	animations: {
		shake,
	},
} as const satisfies MantineThemeOther

export const commonTheme = {
	colorScheme: 'light',
	colors: { ...customColors },
	black: colors.secondary.black,
	primaryColor: 'inReachPrimaryRegular',
	primaryShade: 5,
	cursorType: 'pointer',
	loader: 'dots',
	lineHeight: 1.5,
	fontFamily:
		'Work Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
	fontSizes: {
		xs: rem(12),
		sm: rem(14),
		md: rem(16),
		lg: rem(18),
		xl: rem(20),
	},
	headings: {
		fontWeight: 500,
		sizes: themeCustomObj.headings,
		// {
		// 	h1: { fontSize: rem(40), lineHeight: 1.25, fontWeight: 500 },
		// 	h2: { fontSize: rem(24), lineHeight: 1.25, fontWeight: 500 },
		// 	h3: { fontSize: rem(16), lineHeight: 1.25, fontWeight: 600 },
		// 	h4: { fontSize: rem(16), lineHeight: 1.25, fontWeight: 600 },
		// 	h5: { fontSize: rem(16), lineHeight: 1.25, fontWeight: 600 },
		// 	h6: { fontSize: rem(16), lineHeight: 1.25, fontWeight: 600 },
		// },
	},

	shadows: {
		xs: `0 ${rem(1)} ${rem(20)} rgba(0, 0, 0, 0.1)`,
		// xs: '0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.05), 0 0.0625rem 0.125rem rgba(0, 0, 0, 0.1)',
		sm: '0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 0.625rem 0.9375rem -0.3125rem, rgba(0, 0, 0, 0.04) 0 0.4375rem 0.4375rem -0.3125rem',
		md: '0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 1.25rem 1.5625rem -0.3125rem, rgba(0, 0, 0, 0.04) 0 0.625rem 0.625rem -0.3125rem',
		lg: '0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 1.75rem 1.4375rem -0.4375rem, rgba(0, 0, 0, 0.04) 0 0.75rem 0.75rem -0.4375rem',
		xl: '0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 2.25rem 1.75rem -0.4375rem, rgba(0, 0, 0, 0.04) 0 1.0625rem 1.0625rem -0.4375rem',
	},

	radius: {
		xs: rem(2),
		sm: rem(4),
		md: rem(8),
		lg: rem(16),
		xl: rem(32),
	},
	spacing: {
		xxs: rem(6),
		xs: rem(8),
		sm: rem(12),
		md: rem(16),
		lg: rem(20),
		xl: rem(24),
	},

	breakpoints: {
		xs: em(500),
		sm: em(768),
		md: em(1024),
		lg: em(1200),
		xl: em(1440),
	},

	other: themeCustomObj,
	components: {
		ActionIcon: {
			defaultProps: (theme) =>
				({
					color: theme.other.colors.secondary.cornflower,
					radius: 'xl',
				}) satisfies ActionIconProps,
		},
		Anchor: {
			styles: (theme) => ({
				root: {
					// color: `${theme.other.colors.secondary.black} !important`,
					padding: `${rem(10)} ${rem(8)}`,
					borderRadius: theme.spacing.sm,
					textDecoration: 'underline',
					...theme.other.utilityFonts.utility1,
					...theme.fn.hover({
						backgroundColor: theme.other.colors.primary.lightGray,
						textDecoration: 'none',
					}),
				},
			}),
			variants: variants.Anchor,
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
						border: `${rem(1)} solid`,
						padding: `${theme.spacing.xxs} ${theme.spacing.sm}`,
						textTransform: 'none',
						// margin: rem(8),
						// marginBottom: rem(8),
					},
					inner: {
						padding: 0,
						fontWeight: theme.other.fontWeight.semibold,
						color: theme.other.colors.secondary.black,
					},
					leftSection: {
						margin: 0,
					},
				}) satisfies Styles<BadgeStylesNames, BadgeStylesParams>,
			variants: variants.Badge,
		},
		Button: {
			defaultProps: {
				radius: 'xl',
			} satisfies ButtonProps,
			styles: (theme) => ({
				root: {
					padding: `calc(${theme.spacing.sm} / 2)`,
					paddingLeft: `calc(${theme.spacing.xl} * 2)`,
					paddingRight: `calc(${theme.spacing.xl} * 2)`,
					height: `calc(${theme.spacing.xl} * 2)`,
					backgroundColor: theme.other.colors.secondary.black,
					'&:not([data-disabled])': theme.fn.hover({
						background: theme.fn.lighten(theme.other.colors.secondary.black, 0.4),
					}),
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
			variants: variants.Button,
		},
		Card: {
			defaultProps: {
				withBorder: true,
				radius: 'lg',
				padding: rem(20),
			} satisfies Partial<CardProps>,
			styles: (theme) => ({
				root: {
					[theme.fn.largerThan('sm')]: {
						padding: rem(24),
					},
				},
			}),
			variants: variants.Card,
		},

		Checkbox: {
			styles: (theme, params: CheckboxStylesParams) =>
				({
					root: {
						padding: `${rem(8)} 0 ${rem(8)} ${rem(4)}`,
						...theme.fn.hover({
							backgroundColor: theme.other.colors.primary.lightGray,
						}),
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
							borderColor: params.indeterminate ? undefined : theme.other.colors.secondary.black,
						},
						'&:disabled': {
							backgroundColor: theme.other.colors.primary.lightGray,
						},
					},
					inner: {
						height: rem(24),
						width: rem(24),
					},
					icon: {
						width: params.indeterminate ? rem(12) : rem(14),
						height: params.indeterminate ? rem(3) : rem(10.5),
						margin: params.indeterminate ? `${rem(10.5)} ${rem(6)}` : `${rem(6.75)} ${rem(5)}`,
					},
				}) satisfies Styles<CheckboxStylesNames, CheckboxStylesParams>,
		},
		Container: {
			defaultProps: {
				maw: em(1440),
			},
			styles: (theme) => ({
				root: {
					margin: '0 auto',
					padding: `${rem(0)} ${rem(20)}`,
					[theme.fn.largerThan('xs')]: {
						padding: `${rem(0)} ${rem(32)}`,
					},
					[theme.fn.largerThan('sm')]: {
						padding: `${rem(0)} ${rem(40)}`,
						// marginBottom: 'unset',
					},
					[theme.fn.largerThan('lg')]: {
						padding: `${rem(0)} ${rem(64)}`,
					},
				},
			}),
		},
		Divider: {
			defaultProps: (theme) => ({
				size: rem(1),
				color: theme.other.colors.tertiary.coolGray,
			}),
			variants: variants.Divider,
		},
		Drawer: {
			styles: (theme) =>
				({
					content: {
						borderRadius: `${rem(32)} ${rem(32)} ${rem(0)} ${rem(0)}`,
						padding: `${rem(0)} ${rem(0)}`,
					},
					header: {
						borderBottom: `${rem(1)} solid ${theme.other.colors.primary.lightGray}`,
						padding: `${rem(16)} ${rem(31)} ${rem(16)} ${rem(36)}`,
					},
					body: {
						padding: `${rem(0)} ${rem(36)} ${rem(16)} ${rem(36)}`,
					},
				}) satisfies Styles<DrawerStylesNames>,
		},
		Grid: {
			defaultProps: {
				columns: 12,
				gutter: rem(20),
				gutterXl: rem(40),
				justify: 'center',
				my: 0,
				// align: 'flex-start',
			} satisfies Partial<GridProps>,
		},
		GridCol: {
			defaultProps: {
				xs: 6,
				sm: 4,
			} satisfies ColProps,
		},
		Input: {
			styles: (theme) =>
				({
					input: {
						borderColor: theme.other.colors.tertiary.coolGray,
						borderRadius: rem(8),
						...theme.other.utilityFonts.utility2,
						padding: `${rem(14)} ${rem(16)}`,
						margin: `${rem(10)} 0`,
						height: rem(48),
						'&::placeholder': {
							color: theme.other.colors.secondary.darkGray,
						},
						'&:focus, &:focus-within': {
							borderColor: theme.other.colors.secondary.black,
							borderWidth: rem(2),
						},
						'&[data-with-icon]': {
							borderRadius: theme.radius.xl,
							paddingLeft: rem(36),
						},
						'&[data-invalid]': {
							'&::placeholder': {
								color: theme.other.colors.secondary.darkGray,
							},
							'&:focus, &:focus-within': {
								color: theme.other.colors.secondary.black,
								borderColor: theme.other.colors.tertiary.red,
								borderWidth: rem(2),
							},
						},
						'&[data-disabled],:disabled': {
							backgroundColor: theme.other.colors.primary.lightGray,
							color: theme.other.colors.secondary.darkGray,
							opacity: 1,
							'&::placeholder': {
								color: theme.other.colors.secondary.darkGray,
							},
						},
					},
					icon: {
						color: theme.other.colors.secondary.black,
						marginLeft: theme.spacing.md,
						width: 'fit-content',
					},
					rightSection: {
						paddingRight: theme.spacing.md,
					},
					wrapper: {
						margin: 0,
					},
				}) satisfies Styles<InputStylesNames, InputStylesParams>,
			variants: variants.Input,
		},
		InputWrapper: {
			defaultProps: {
				inputWrapperOrder: ['label', 'input', 'description', 'error'],
			} satisfies Partial<InputWrapperProps>,
			styles: (theme, { error }: InputWrapperBaseProps) =>
				({
					label: {
						fontSize: rem(16),
						paddingBottom: 0,
					},
					description: {
						['&:has(~ .mantine-InputWrapper-error)']: {
							display: 'none',
						},
						...theme.other.utilityFonts.utility4,
						color: `${theme.other.colors.secondary.darkGray}`,
						'&:focus': {
							outline: 'none',
						},
						'&[data-success]': {
							...theme.other.utilityFonts.utility3,
						},
					},
					error: {
						...theme.other.utilityFonts.utility3,
					},
					root: {
						width: '100%',
					},
				}) satisfies Styles<InputWrapperStylesNames>,
		},
		List: {
			variants: variants.List,
		},
		Loader: {
			defaultProps: (theme) => ({
				color: theme.other.colors.secondary.darkGray,
			}),
		},
		LoadingOverlay: {
			defaultProps: (theme) => ({
				overlayBlur: 2,
				radius: 'sm',
			}),
		},
		Modal: {
			defaultProps: (theme) => {
				return {
					radius: theme.radius.xl,
					centered: true,
					size: 'auto',
					withCloseButton: false,
				} satisfies Partial<ModalProps>
			},
			styles: (theme) =>
				({
					content: {
						padding: '0px !important',
						maxWidth: rem(600),
						[theme.fn.largerThan('sm')]: {
							maxHeight: em(800),
							minWidth: em(600),
						},
					},
					header: {
						margin: 0,
						padding: `${rem(32)} ${rem(20)} ${rem(16)} ${rem(12)}`,
						borderBottom: rem(1),
						borderBottomStyle: 'solid',
						borderColor: theme.other.colors.primary.lightGray,
						[theme.fn.largerThan('xs')]: {
							padding: `${rem(16)} ${rem(32)} ${rem(16)} ${rem(24)}`,
						},
						maxHeight: rem(80),
					},
					body: {
						padding: rem(20),
						'&:not(:only-child)': {
							paddingTop: rem(20),
						},
						[theme.fn.largerThan('xs')]: {
							padding: `${rem(20)} ${rem(32)}`,
							'&:not(:only-child)': {
								paddingTop: rem(20),
							},
						},
						[theme.fn.largerThan('sm')]: {
							padding: `${rem(40)} ${rem(32)}`,
							'&:not(:only-child)': {
								paddingTop: rem(40),
							},
						},
					},
					title: {
						margin: 0,
						width: '100%',
						padding: 0,
					},
				}) satisfies Styles<ModalStylesNames>,
		},
		PaginationRoot: {
			defaultProps: (theme) => ({
				siblings: 0,
				color: theme.other.colors.secondary.white,
			}),
		},
		Paper: {
			styles: (theme) => ({
				root: {
					padding: rem(20),
					borderRadius: rem(16),
					'&[data-with-border]': {
						border: `${rem(1)} solid ${theme.other.colors.tertiary.coolGray}`,
					},
				},
			}),
		},
		PasswordInput: {
			styles: (theme) => ({
				innerInput: {
					height: 'unset',
					...theme.other.utilityFonts.utility2,
					'&::placeholder': {
						color: theme.other.colors.secondary.darkGray,
					},
				},
				input: {
					'&::placeholder': {
						color: theme.other.colors.secondary.darkGray,
					},
				},
			}),
		},
		Radio: {
			styles: (theme) =>
				({
					root: {
						padding: `${rem(10)} ${rem(0)} ${rem(10)} ${rem(4)}`,
						...theme.fn.hover({
							backgroundColor: theme.other.colors.primary.lightGray,
						}),
					},
					label: {
						...theme.other.utilityFonts.utility2,
					},
					radio: {
						backgroundColor: theme.other.colors.secondary.white,
						borderColor: theme.other.colors.secondary.black,
						color: theme.other.colors.secondary.black,
						borderWidth: rem(2),
						'&:checked': {
							background: theme.other.colors.secondary.black,
							borderColor: theme.other.colors.secondary.black,
						},
						'&:disabled': {
							backgroundColor: theme.other.colors.primary.lightGray,
						},
					},
				}) satisfies Styles<RadioStylesNames, RadioStylesParams>,
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
					columnGap: rem(4),
				},
			}),
		},
		Select: {
			variants: variants.Input,
		},
		Skeleton: {
			defaultProps: (theme) =>
				({
					radius: 'xl',
				}) satisfies SkeletonProps,
			styles: (theme, { circle }: SkeletonStylesParams) =>
				({
					root: {
						minWidth: circle ? undefined : rem(100),
					},
				}) satisfies Styles<'root', SkeletonStylesParams>,

			variants: variants.Skeleton,
		},
		Slider: {
			defaultProps: (theme) =>
				({
					color: theme.other.colors.secondary.black,
					thumbSize: 12,
					label: null,
				}) satisfies SliderProps,
			styles: (theme) =>
				({
					bar: {
						height: rem(2),
						backgroundColor: theme.other.colors.secondary.black,
					},
					track: {
						height: rem(2),
					},
					thumb: {
						backgroundColor: theme.other.colors.secondary.black,
						borderColor: `${theme.other.colors.secondary.black} !important`,
					},
					mark: {
						backgroundColor: 'inherit',
						border: 'none',
					},
					markLabel: {
						color: theme.other.colors.secondary.black,
					},
				}) satisfies Styles<SliderStylesNames>,
		},
		Switch: {
			defaultProps: {
				labelPosition: 'left',
			} satisfies SwitchProps,
			styles: (theme) =>
				({
					root: {
						padding: `${rem(12)} ${rem(4)}`,
						...theme.fn.hover({
							backgroundColor: theme.other.colors.primary.lightGray,
						}),
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
						height: rem(16),
						width: rem(48),
						backgroundColor: theme.other.colors.tertiary.coolGray,
						overflow: 'inherit',
						'input:checked + &': {
							backgroundColor: theme.other.colors.tertiary.coolGray,
							borderColor: theme.other.colors.tertiary.coolGray,
						},
					},
					thumb: {
						left: 0,
						height: rem(24),
						width: rem(24),
						borderWidth: rem(0.5),
						borderColor: theme.fn.darken(theme.other.colors.secondary.white, 0.04),
						boxShadow: `${rem(0)} ${rem(3)} ${rem(8)}  rgba(0, 0, 0, 0.15), ${rem(0)} ${rem(3)} ${rem(
							1
						)} rgba(0, 0, 0, 0.06)`,
						'input:checked + * > &': {
							backgroundColor: theme.other.colors.secondary.black,
							borderColor: theme.fn.darken(theme.other.colors.secondary.black, 0.04),
							left: `calc(100% - ${rem(16)})`,
						},
						'input:disabled + * > &': {
							backgroundColor: theme.other.colors.primary.lightGray,
							borderColor: theme.other.colors.primary.lightGray,
						},
					},
				}) satisfies Styles<SwitchStylesNames, SwitchStylesParams>,
		},
		SwitchGroup: {
			styles: (theme) => ({
				label: {
					paddingBottom: rem(16),
				},
			}),
			// defaultProps: {
			// 	orientation: 'vertical',
			// } satisfies Partial<SwitchGroupProps>,
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
						padding: `${rem(16)} ${rem(24)}`,
						'&[data-active]': {
							borderColor: theme.other.colors.secondary.black,
						},
						'&[data-active]:hover': {
							borderColor: theme.other.colors.secondary.black,
						},
						...theme.fn.hover({ backgroundColor: theme.other.colors.primary.lightGray }),
					},
					tabLabel: {
						...theme.other.utilityFonts.utility1,
					},
					panel: {
						margin: `${rem(40)} 0`,
					},
				}) satisfies Styles<TabsStylesNames, TabsStylesParams>,
		},
		Text: {
			defaultProps: (theme) => ({
				component: 'span',
				weight: theme.other.fontWeight.regular,
				color: theme.other.colors.secondary.black,
				size: 'md',
			}),
			variants: variants.Text,
		},
		Textarea: {
			defaultProps: {} satisfies TextareaProps,
			styles: (theme) => ({
				input: {
					height: rem(96),
					padding: `${rem(14)} ${rem(16)} !important`,
				},
			}),
		},
		TextInput: {
			styles: (theme) => ({
				input: {
					height: rem(48),
				},
				withIcon: {
					borderRadius: theme.radius.xl,
					paddingLeft: rem(36),
				},
				rightSection: {
					paddingRight: theme.spacing.md,
				},
			}),
			variants: variants.Input,
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
				}) satisfies Styles<'root', TitleStylesParams>,
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
			variants: variants.Tooltip,
		},
		TypographyStylesProvider: {
			styles: (theme) => {
				const headings = keys(theme.headings.sizes).reduce((acc: Record<string, CSSObject>, h) => {
					acc[`& ${h}`] = {
						marginBottom: 0,
						[`@media (max-width: ${em(755)})`]: {
							fontSize: theme.headings.sizes[h].fontSize,
						},
					}

					return acc
				}, {})

				return {
					root: {
						...headings,
						'& p': {
							marginBottom: 0,
							[`@media (max-width: ${em(755)})`]: {
								fontSize: theme.fontSizes.md,
							},
						},
					},
				} satisfies Styles<'root', TypographyStylesProviderProps>
			},
		},
	},
} satisfies MantineThemeOverride

export type ThemeCustomObject = typeof themeCustomObj
