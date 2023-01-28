import {
	Button as MantineButton,
	ButtonProps,
	ButtonVariant,
	CSSObject,
	createStyles,
	ButtonStylesNames,
	MantineTheme,
} from '@mantine/core'
import { PolymorphicComponentProps } from '@mantine/utils'
import { merge } from 'merge-anything'
import { forwardRef } from 'react'

const buttonVariants: ButtonVariants = (theme, params) => {
	switch (params.variant) {
		case 'filled':
			return {
				root: {
					backgroundColor: theme.colors.inReachPrimaryRegular[5],
					'&:hover': {
						backgroundColor: theme.colors.inReachPrimaryHover[5],
					},
				},
			}
		case 'outline':
			return {
				root: {
					outlineColor: theme.colors.inReachPrimaryRegular[5],
					'&:hover': {
						outlineColor: theme.colors.inReachPrimaryHover[5],
					},
				},
			}
		case 'sm-primary':
			return {
				root: {
					paddingLeft: theme.spacing.md * 2,
					paddingRight: theme.spacing.md * 2,
					height: theme.spacing.lg * 2,
				},
				inner: {
					color: theme.other.colors.secondary.white,
					label: {
						left: theme.spacing.md * 2,
					},
					leftIcon: {
						display: 'none',
					},
				},
			}
		case 'sm-secondary':
			return {
				root: {
					paddingLeft: theme.spacing.md * 2,
					paddingRight: theme.spacing.md * 2,
					height: theme.spacing.lg * 2,
					border: theme.other.border.default,
					borderColor: theme.other.colors.tertiary.coolGray,
					backgroundColor: theme.other.colors.secondary.white,
					'&:hover': {
						backgroundColor: theme.other.colors.primary.lightGray,
					},
				},
				inner: {
					color: theme.colors.primaryText[9],
					label: {
						left: theme.spacing.md * 2,
					},
					leftIcon: {
						display: 'none',
					},
				},
			}
		case 'sm-accent':
			return {
				root: {
					paddingLeft: theme.spacing.md * 2,
					paddingRight: theme.spacing.md * 2,
					height: theme.spacing.lg * 2,
					backgroundColor: theme.other.colors.tertiary.red,
					'&:hover': {
						background: theme.fn.darken(theme.other.colors.tertiary.red, 0.4),
					},
				},
				inner: {
					color: theme.colors.primaryText[0],
					label: {
						left: theme.spacing.md * 2,
					},
					leftIcon: {
						display: 'none',
					},
				},
			}
		case 'lg-primary':
			return {
				root: {
					borderRadius: theme.radius.md,
				},
			}
		case 'lg-secondary':
			return {
				root: {
					border: theme.other.border.default,
					borderColor: theme.other.colors.tertiary.coolGray,
					backgroundColor: theme.other.colors.secondary.white,
					borderRadius: theme.radius.md,
					'&:hover': {
						backgroundColor: theme.other.colors.primary.lightGray,
					},
				},
				inner: {
					color: theme.colors.primaryText[9],
				},
			}
		case 'lg-accent':
			return {
				root: {
					backgroundColor: theme.colors.inReachSecondaryRegular[5],
					'&:hover': {
						background: theme.fn.darken(theme.colors.inReachSecondaryRegular[5], 0.4),
					},
				},
			}
		default: {
			return {}
		}
	}
}

const useVariantStyles = createStyles((theme, params: ButtonStylesParams) => {
	const baseStyle = {
		root: {
			padding: theme.spacing.sm / 2,
			paddingLeft: theme.spacing.xl * 2,
			paddingRight: theme.spacing.xl * 2,
			height: theme.spacing.xl * 2,
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
			lineHeight: `${theme.spacing.lg}px`,
		},
	} satisfies CustomButtonStyles
	return merge(baseStyle, buttonVariants(theme, params))
})

// eslint-disable-next-line react/display-name
export const Button = forwardRef<HTMLButtonElement, PolymorphicComponentProps<'button', CustomButtonProps>>(
	(props, ref) => {
		const customVariants = [
			'sm-primary',
			'sm-secondary',
			'sm-accent',
			'lg-primary',
			'lg-secondary',
			'lg-accent',
		]
		const isCustom = customVariants.includes(props.variant ?? 'filled')

		const { classes: baseClasses } = useVariantStyles({ variant: props.variant ?? 'filled' })

		const { children, variant, classNames, ...others } = props as ButtonProps

		const mantineVariant = isCustom ? undefined : (variant as ButtonVariant)

		return (
			<MantineButton
				variant={mantineVariant}
				classNames={merge(classNames, baseClasses)}
				ref={ref}
				{...others}
			>
				{children}
			</MantineButton>
		)
	}
)

interface ButtonStylesParams {
	variant?: ButtonVariant | CustomVariants
}

type CustomButtonProps = Omit<ButtonProps, 'variant'> & {
	variant?: ButtonVariant | CustomVariants
}
type CustomVariants =
	| 'sm-primary'
	| 'sm-secondary'
	| 'sm-accent'
	| 'lg-primary'
	| 'lg-secondary'
	| 'lg-accent'

type CustomButtonStyles = Partial<{ [className in ButtonStylesNames]: CSSObject }>
type ButtonVariants = (theme: MantineTheme, params: ButtonStylesParams) => CustomButtonStyles
