import {
	Badge as MantineBadge,
	BadgeProps,
	BadgeVariant,
	CSSObject,
	createStyles,
	BadgeStylesNames,
	MantineTheme,
} from '@mantine/core'
import { PolymorphicComponentProps } from '@mantine/utils'
import { merge } from 'merge-anything'
import { forwardRef } from 'react'

const badgeVariants: BadgeVariants = (theme, params) => {
	switch (params.variant) {
		case 'commmunityTag-large':
			return {
				root: {
					height: theme.spacing.xl + 8,
					backgroundColor: theme.other.colors.secondary.white,
					borderColor: theme.other.colors.tertiary.coolGray,
				},
				inner: {
					paddingTop: theme.spacing.sm / 2,
					paddingBottom: theme.spacing.sm / 2,
					fontSize: theme.fontSizes.md,
				},
				leftSection: {
					paddingTop: theme.spacing.sm / 2,
					paddingBottom: theme.spacing.sm / 2,
					fontSize: theme.fontSizes.md,
					marginRight: 0,
				},
			}
		case 'commmunityTag-small':
			return {
				root: {
					height: theme.spacing.xl,
					backgroundColor: theme.other.colors.secondary.white,
					borderColor: theme.other.colors.tertiary.coolGray,
				},
				inner: {
					paddingTop: theme.spacing.sm / 4,
					paddingBottom: theme.spacing.sm / 4,
					fontSize: theme.fontSizes.sm,
				},
				leftSection: {
					paddingTop: theme.spacing.sm / 4,
					paddingBottom: theme.spacing.sm / 4,
					fontSize: theme.fontSizes.sm,
					marginRight: 0,
				},
			}
		case 'serviceTag-large':
			return {
				root: {
					height: theme.spacing.xl + 8,
					backgroundColor: theme.other.colors.primary.lightGray,
				},
				inner: {
					paddingTop: theme.spacing.sm / 2,
					paddingBottom: theme.spacing.sm / 2,
					fontSize: theme.fontSizes.md,
				},
			}
		case 'serviceTag-small':
			return {
				root: {
					height: theme.spacing.xl,
					backgroundColor: theme.other.colors.primary.lightGray,
				},
				inner: {
					paddingTop: theme.spacing.sm / 4,
					paddingBottom: theme.spacing.sm / 4,
					fontSize: theme.fontSizes.sm,
				},
			}
		default:
			return {}
	}
}

const useVariantStyles = createStyles((theme, params: BadgeStylesParams) => {
	const baseStyle = {
		root: {
			border: '1px solid',
			paddingLeft: theme.spacing.sm,
			paddingRight: theme.spacing.sm,
		},
		inner: {
			textTransform: 'none',
			fontWeight: theme.other.fontWeight.semibold,
			color: theme.other.colors.secondary.black,
		},
	} as const
	const variants = badgeVariants(theme, params)

	const mergedStyle = merge(baseStyle, variants)

	return mergedStyle
})

// eslint-disable-next-line react/display-name
export const Badge = forwardRef<HTMLDivElement, PolymorphicComponentProps<'div', CustomBadgeProps>>(
	(props, ref) => {
		const customVariants = [
			'commmunityTag-large',
			'commmunityTag-small',
			'serviceTag-large',
			'serviceTag-small',
			'leader',
			'verified',
			'claimed',
			'unclaimed',
		]
		const isCustom = customVariants.includes(props.variant ?? 'light')

		const { classes: baseClasses } = useVariantStyles({ variant: props.variant ?? 'light' })

		const { children, variant, classNames, ...others } = props as BadgeProps

		const mantineVariant = isCustom ? undefined : (variant as BadgeVariant)

		return (
			<MantineBadge
				variant={mantineVariant}
				classNames={merge(classNames, baseClasses)}
				ref={ref}
				{...others}
			>
				{children}
			</MantineBadge>
		)
	}
)

interface BadgeStylesParams {
	variant?: BadgeVariant | CustomVariants
}
type CustomBadgeProps = Omit<BadgeProps, 'variant'> & {
	variant?: BadgeVariant | CustomVariants
}
type CustomVariants =
	| 'commmunityTag-large'
	| 'commmunityTag-small'
	| 'serviceTag-large'
	| 'serviceTag-small'
	| 'leader'
	| 'verified'
	| 'claimed'
	| 'unclaimed'

export type CustomBadgeStyles = Partial<{ [className in BadgeStylesNames]: CSSObject }>
type BadgeVariants = (theme: MantineTheme, params: BadgeStylesParams) => CustomBadgeStyles
