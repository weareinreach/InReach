import {
	Button as MantineButton,
	ButtonProps,
	CSSObject,
	createStyles,
	ButtonStylesNames,
	MantineTheme,
} from '@mantine/core'
import { PolymorphicComponentProps } from '@mantine/utils'
import { merge } from 'merge-anything'
import { forwardRef, ReactNode } from 'react'

const buttonVariants: ButtonVariants = (theme, params) => {
	switch (params.variant) {
		case 'filled':
			return {
				root: {
					paddingLeft: `calc(${theme.spacing.md} * 2)`,
					paddingRight: `calc(${theme.spacing.md} * 2)`,
					height: `calc(${theme.spacing.lg} * 2)`,
				},
				inner: {
					color: theme.other.colors.secondary.white,
					label: {
						left: `calc(${theme.spacing.md} * 2)`,
					},
					leftIcon: {
						display: 'none',
					},
				},
			}
		case 'outline':
			return {
				root: {
					paddingLeft: `calc(${theme.spacing.md} * 2)`,
					paddingRight: `calc(${theme.spacing.md} * 2)`,
					height: `calc(${theme.spacing.lg} * 2)`,
					border: theme.other.border.default,
					borderColor: theme.other.colors.tertiary.coolGray,
					backgroundColor: theme.other.colors.secondary.white,
					'&:not([data-disabled])': theme.fn.hover({
						backgroundColor: theme.other.colors.primary.lightGray,
					}),
				},
				inner: {
					color: theme.other.colors.secondary.black,
					label: {
						left: `calc(${theme.spacing.md} * 2)`,
					},
					leftIcon: {
						display: 'none',
					},
				},
			}
		case 'primary':
			return {
				root: {
					paddingLeft: `calc(${theme.spacing.md} * 2)`,
					paddingRight: `calc(${theme.spacing.md} * 2)`,
					height: `calc(${theme.spacing.lg} * 2)`,
				},
				'&:not([data-disabled])': theme.fn.hover({
					backgroundColor: theme.fn.darken(theme.other.colors.secondary.white, 0.4),
				}),
				inner: {
					color: theme.other.colors.secondary.white,
					label: {
						left: `calc(${theme.spacing.md} * 2)`,
					},
					leftIcon: {
						display: 'none',
					},
				},
			}
		case 'secondary':
			return {
				root: {
					paddingLeft: `calc(${theme.spacing.md} * 2)`,
					paddingRight: `calc(${theme.spacing.md} * 2)`,
					height: `calc(${theme.spacing.lg} * 2)`,
					border: theme.other.border.default,
					borderColor: theme.other.colors.tertiary.coolGray,
					backgroundColor: theme.other.colors.secondary.white,
					'&:not([data-disabled])': theme.fn.hover({
						backgroundColor: theme.other.colors.primary.lightGray,
					}),
				},
				inner: {
					color: theme.other.colors.secondary.black,
					label: {
						left: `calc(${theme.spacing.md} * 2)`,
					},
					leftIcon: {
						display: 'none',
					},
				},
			}
		case 'accent':
			return {
				root: {
					paddingLeft: `calc(${theme.spacing.md} * 2)`,
					paddingRight: `calc(${theme.spacing.md} * 2)`,
					height: `calc(${theme.spacing.lg} * 2)`,
					backgroundColor: theme.other.colors.tertiary.red,
					'&:not([data-disabled])': theme.fn.hover({
						background: theme.fn.darken(theme.other.colors.tertiary.red, 0.4),
					}),
				},
				inner: {
					color: theme.other.colors.secondary.white,
					label: {
						left: `calc(${theme.spacing.md} * 2)`,
					},
					leftIcon: {
						display: 'none',
					},
				},
			}
		case 'primary-icon':
			return {
				root: {
					borderRadius: theme.radius.md,
				},
				'&:not([data-disabled])': theme.fn.hover({
					backgroundColor: theme.fn.darken(theme.other.colors.secondary.white, 0.4),
				}),
			}
		case 'secondary-icon':
			return {
				root: {
					border: theme.other.border.default,
					borderColor: theme.other.colors.tertiary.coolGray,
					backgroundColor: theme.other.colors.secondary.white,
					borderRadius: theme.radius.md,
					'&:not([data-disabled])': theme.fn.hover({
						backgroundColor: theme.other.colors.primary.lightGray,
					}),
				},
				inner: {
					color: theme.other.colors.secondary.black,
					'&:disabled, &[data-disabled]': {
						color: theme.other.colors.secondary.darkGray,
					},
				},
			}
		case 'accent-icon':
			return {
				root: {
					backgroundColor: theme.other.colors.secondary.cornflower,
					'&:not([data-disabled])': theme.fn.hover({
						background: theme.fn.darken(theme.other.colors.secondary.cornflower, 0.4),
					}),
				},
			}
		default: {
			return {}
		}
	}
}

const useVariantStyles = createStyles((theme, params: ButtonStylesParams) => buttonVariants(theme, params))

const customVariants = [
	'primary',
	'secondary',
	'accent',
	'primary-icon',
	'secondary-icon',
	'accent-icon',
] as const

// eslint-disable-next-line react/display-name
export const Button = forwardRef<HTMLButtonElement, PolymorphicComponentProps<'button', CustomButtonProps>>(
	(props, ref) => {
		const isCustom = (customVariants as ReadonlyArray<string>).includes(props.variant ?? 'filled')

		const { classes: baseClasses } = useVariantStyles({ variant: props.variant ?? 'filled' })

		const { children, variant, classNames, ...others } = props as ButtonProps

		const mantineVariant = isCustom ? undefined : (variant as ButtonVariant)

		return (
			<MantineButton
				variant={mantineVariant}
				classNames={merge(classNames, baseClasses)}
				ref={ref}
				{...others}
				w={props.fullWidth ? '100%' : undefined}
			>
				{children}
			</MantineButton>
		)
	}
)

interface ButtonStylesParams {
	variant?: CustomVariants | 'filled' | 'outline'
}
type MantineButtonProps = Pick<
	ButtonProps,
	'type' | 'fullWidth' | 'uppercase' | 'loaderProps' | 'loaderPosition'
>

interface CustomButtonProps extends MantineButtonProps {
	/** Button style/design */
	variant?: CustomVariants | 'filled' | 'outline'
	/** Label Text */
	children?: ReactNode
	/** Icon to render for 'icon' variants - pass in the full Icon component */
	leftIcon?: JSX.Element
	/** Disabled state */
	disabled?: boolean
	/** Set width to 100% */
	fullWidth?: boolean
	loading?: boolean
}
type CustomVariants = (typeof customVariants)[number]
type ButtonVariant = ButtonProps['variant']
type CustomButtonStyles = Partial<{ [className in ButtonStylesNames]: CSSObject }>
type ButtonVariants = (theme: MantineTheme, params: ButtonStylesParams) => CustomButtonStyles
