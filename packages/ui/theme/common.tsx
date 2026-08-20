import {
	type AnchorProps,
	type AvatarProps,
	type BadgeProps,
	type CardProps,
	createTheme,
	em,
	type GridProps,
	type InputWrapperProps,
	type ListProps,
	type MantineColorScheme,
	type MantineTheme,
	rem,
	type SkeletonProps,
	type SliderProps,
	type SwitchProps,
	type TextareaProps,
	type TextProps,
	type TitleProps,
	type TooltipProps,
} from '@mantine/core'
import React from 'react'

import { Icon } from '~ui/icon'

import { customColors } from './colors'
import anchorBaseClasses from './components/Anchor.module.css'
import cardBaseClasses from './components/Card.module.css'
import checkboxClasses from './components/Checkbox.module.css'
import containerClasses from './components/Container.module.css'
import inputClasses from './components/Input.module.css'
import inputWrapperClasses from './components/InputWrapper.module.css'
import modalClasses from './components/Modal.module.css'
import paperClasses from './components/Paper.module.css'
import passwordInputClasses from './components/PasswordInput.module.css'
import radioClasses from './components/Radio.module.css'
import switchClasses from './components/Switch.module.css'
import tabsClasses from './components/Tabs.module.css'
import titleBaseClasses from './components/Title.module.css'
import typographyClasses from './components/Typography.module.css'
import { Anchor as anchorVariants } from './variants/Anchor'
import { Card as cardVariants } from './variants/Card'
import { List as listVariants } from './variants/List'
import { Skeleton as skeletonVariants } from './variants/Skeleton'
import { Text as textVariants } from './variants/Text'
import { Title as titleVariants } from './variants/Title'
import { Tooltip as tooltipVariants } from './variants/Tooltip'

/** Joins CSS module class names, skipping falsy values. */
const cx = (...classNames: Array<string | undefined>) => classNames.filter(Boolean).join(' ')

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
} as const

export const commonTheme = createTheme({
	colors: { ...customColors },
	black: colors.secondary.black,
	primaryColor: 'inReachPrimaryRegular',
	primaryShade: 5,
	cursorType: 'pointer',
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
		// v7 requires fontWeight as a string (was a number in v6)
		fontWeight: '500',
		sizes: {
			h1: { fontSize: rem(40), lineHeight: '1.25', fontWeight: '500' },
			h2: { fontSize: rem(24), lineHeight: '1.25', fontWeight: '500' },
			h3: { fontSize: rem(16), lineHeight: '1.25', fontWeight: '600' },
			h4: { fontSize: rem(16), lineHeight: '1.25', fontWeight: '600' },
			h5: { fontSize: rem(16), lineHeight: '1.25', fontWeight: '600' },
			h6: { fontSize: rem(16), lineHeight: '1.25', fontWeight: '600' },
		},
	},

	shadows: {
		xs: `0 ${rem(1)} ${rem(20)} rgba(0, 0, 0, 0.1)`,
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
			defaultProps: (theme: MantineTheme) => ({
				color: theme.other.colors.secondary.cornflower,
				radius: 'xl',
			}),
		},
		Anchor: {
			classNames: (_theme: MantineTheme, props: AnchorProps) => ({
				root: cx(anchorBaseClasses.root, props.variant ? anchorVariants[props.variant]?.root : undefined),
			}),
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
			styles: (theme: MantineTheme) => ({
				root: {
					letterSpacing: 'inherit',
					border: `${rem(1)} solid`,
					padding: `${theme.spacing.xxs} ${theme.spacing.sm}`,
					textTransform: 'none',
				},
				inner: {
					padding: 0,
					fontWeight: theme.other.fontWeight.semibold,
					color: theme.other.colors.secondary.black,
				},
				leftSection: {
					margin: 0,
				},
			}),
		},
		Button: {
			// Button.tsx (~ui/components/core/Button) owns all its own styling/variants
			// via a dedicated CSS module - this is just the app-wide default.
			defaultProps: {
				radius: 'xl',
			},
		},
		Card: {
			defaultProps: {
				withBorder: true,
				radius: 'lg',
				padding: rem(20),
			},
			classNames: (_theme: MantineTheme, props: CardProps) => ({
				root: cx(cardBaseClasses.root, props.variant ? cardVariants[props.variant]?.root : undefined),
			}),
		},
		Checkbox: {
			classNames: checkboxClasses,
		},
		CloseButton: {
			defaultProps: (theme: MantineTheme) => ({
				children: (
					<Icon icon='carbon:close' height={24} width={24} color={theme.other.colors.secondary.black} />
				),
			}),
		},
		Container: {
			defaultProps: {
				maw: em(1440),
			},
			classNames: containerClasses,
		},
		Divider: {
			defaultProps: (theme: MantineTheme) => ({
				size: rem(1),
				color: theme.other.colors.tertiary.coolGray,
			}),
		},
		Drawer: {
			styles: (theme: MantineTheme) => ({
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
			}),
		},
		Grid: {
			defaultProps: {
				columns: 12,
				// v7 replaced the separate `gutterXl` prop with a responsive value object; v9 renamed
				// `gutter` itself to `gap` for consistency with other layout components
				gap: { base: rem(20), xl: rem(40) },
				justify: 'center',
				my: 0,
			} satisfies Partial<GridProps>,
		},
		GridCol: {
			defaultProps: {
				span: { base: 6, sm: 4 },
			},
		},
		Input: {
			classNames: inputClasses,
		},
		InputWrapper: {
			defaultProps: {
				inputWrapperOrder: ['label', 'input', 'description', 'error'],
			} satisfies Partial<InputWrapperProps>,
			classNames: inputWrapperClasses,
		},
		List: {
			classNames: (_theme: MantineTheme, props: ListProps) => {
				const variant = props.variant ? listVariants[props.variant] : undefined
				return {
					root: variant?.root,
					item: variant?.item,
					itemIcon: variant?.itemIcon,
					itemWrapper: variant?.itemWrapper,
				}
			},
		},
		Loader: {
			defaultProps: (theme: MantineTheme) => ({
				// Replaces the removed top-level `theme.loader` setting
				type: 'dots',
				color: theme.other.colors.secondary.darkGray,
			}),
		},
		LoadingOverlay: {
			defaultProps: {
				radius: 'sm',
			},
		},
		Modal: {
			defaultProps: (theme: MantineTheme) => ({
				radius: theme.radius.xl,
				size: 'auto',
				withCloseButton: false,
			}),
			classNames: modalClasses,
		},
		PaginationRoot: {
			defaultProps: (theme: MantineTheme) => ({
				siblings: 0,
				color: theme.other.colors.secondary.white,
			}),
		},
		Paper: {
			classNames: paperClasses,
		},
		PasswordInput: {
			classNames: passwordInputClasses,
		},
		Radio: {
			classNames: radioClasses,
		},
		Rating: {
			defaultProps: (theme: MantineTheme) => ({
				emptySymbol: (
					<Icon icon='carbon:star-filled' color={theme.other.colors.tertiary.coolGray} height={24} />
				),
				fullSymbol: <Icon icon='carbon:star-filled' color={theme.other.colors.secondary.black} height={24} />,
			}),
			styles: () => ({
				root: {
					columnGap: rem(4),
				},
			}),
		},
		Skeleton: {
			defaultProps: {
				radius: 'xl',
			} satisfies SkeletonProps,
			styles: (_theme: MantineTheme, props: SkeletonProps) => ({
				root: {
					minWidth: props.circle ? undefined : rem(100),
					...(props.variant ? skeletonVariants[props.variant]?.root : undefined),
				},
			}),
		},
		Slider: {
			defaultProps: (theme: MantineTheme) =>
				({
					color: theme.other.colors.secondary.black,
					thumbSize: 12,
					label: null,
				}) satisfies SliderProps,
			styles: (theme: MantineTheme) => ({
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
			}),
		},
		Switch: {
			defaultProps: {
				labelPosition: 'left',
			} satisfies SwitchProps,
			classNames: switchClasses,
		},
		SwitchGroup: {
			styles: () => ({
				label: {
					paddingBottom: rem(16),
				},
			}),
		},
		Stack: {
			defaultProps: {
				// v7 renamed `spacing` to `gap`
				gap: 'md',
			},
		},
		Tabs: {
			classNames: tabsClasses,
		},
		Text: {
			defaultProps: (theme: MantineTheme) => ({
				component: 'span',
				fw: theme.other.fontWeight.regular,
				c: theme.other.colors.secondary.black,
				size: 'md',
			}),
			styles: (theme: MantineTheme, props: TextProps) => ({
				root: props.variant ? textVariants(theme)[props.variant]?.root : undefined,
			}),
		},
		Textarea: {
			defaultProps: {} satisfies TextareaProps,
			styles: () => ({
				input: {
					height: rem(96),
					padding: `${rem(14)} ${rem(16)} !important`,
				},
			}),
		},
		TextInput: {
			styles: (theme: MantineTheme) => ({
				input: {
					height: rem(48),
				},
				section: {
					paddingRight: theme.spacing.md,
				},
			}),
		},
		Title: {
			classNames: titleBaseClasses,
			styles: (theme: MantineTheme, props: TitleProps) => ({
				root: props.variant ? titleVariants(theme)[props.variant]?.root : undefined,
			}),
		},
		Tooltip: {
			defaultProps: {
				offset: 10,
				position: 'top-start',
			},
			styles: (theme: MantineTheme, props: TooltipProps) => ({
				tooltip: {
					boxShadow: theme.shadows.xs,
					...(props.variant ? tooltipVariants(theme)[props.variant]?.tooltip : undefined),
				},
			}),
		},
		Typography: {
			classNames: typographyClasses,
		},
	},
	// `createTheme()`'s return type is `MantineThemeOverride` (a PartialDeep<MantineTheme>),
	// making every property optional even though this call always sets them - asserting the
	// full MantineTheme shape here means direct `commonTheme.other.*` access elsewhere doesn't
	// need `!`/optional-chaining at every call site.
}) as MantineTheme

export const defaultColorScheme: MantineColorScheme = 'light'

export type ThemeCustomObject = typeof themeCustomObj
