/* eslint-disable react/display-name */
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
import { forwardRef, ReactNode } from 'react'

const badgeVariants: BadgeVariants = (theme, params) => {
	switch (params.variant) {
		case 'commmunityTag':
			return {
				root: {
					height: theme.spacing.xl,
					backgroundColor: theme.other.colors.secondary.white,
					borderColor: theme.other.colors.tertiary.coolGray,
					[theme.fn.largerThan('sm')]: {
						height: theme.spacing.xl + 8,
					},
				},
				inner: {
					paddingTop: theme.spacing.sm / 4,
					paddingBottom: theme.spacing.sm / 4,
					fontSize: theme.fontSizes.sm,
					[theme.fn.largerThan('sm')]: {
						paddingTop: theme.spacing.sm / 2,
						paddingBottom: theme.spacing.sm / 2,
						fontSize: theme.fontSizes.md,
					},
				},
				leftSection: {
					paddingTop: theme.spacing.sm / 4,
					paddingBottom: theme.spacing.sm / 4,
					fontSize: theme.fontSizes.sm,
					marginRight: 0,
					[theme.fn.largerThan('sm')]: {
						paddingTop: theme.spacing.sm / 2,
						paddingBottom: theme.spacing.sm / 2,
						fontSize: theme.fontSizes.md,
					},
				},
			}
		case 'serviceTag':
			return {
				root: {
					height: theme.spacing.xl,
					backgroundColor: theme.other.colors.primary.lightGray,
					border: 'none',
					[theme.fn.largerThan('sm')]: {
						height: theme.spacing.xl + 8,
					},
				},
				inner: {
					paddingTop: theme.spacing.sm / 4,
					paddingBottom: theme.spacing.sm / 4,
					fontSize: theme.fontSizes.sm,
					[theme.fn.largerThan('sm')]: {
						paddingTop: theme.spacing.sm / 2,
						paddingBottom: theme.spacing.sm / 2,
						fontSize: theme.fontSizes.md,
					},
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

const customVariants = ['commmunityTag', 'serviceTag', 'leader', 'verified', 'claimed', 'unclaimed'] as const

/** Badge variants `serviceTag` and `communityTag` are responsive - the sizing changes at the `sm` breakpoint. */
export const Badge = forwardRef<HTMLDivElement, PolymorphicComponentProps<'div', CustomBadgeProps>>(
	(props, ref) => {
		const isCustom = (customVariants as ReadonlyArray<string>).includes(props.variant ?? 'light')

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
	/** Preset designs */
	variant?: BadgeVariant | CustomVariants
	/**
	 * Item rendered on the left side of the badge. Should be either an emoji unicode string or an Icon
	 * component
	 */
	leftSection?: ReactNode
}
type CustomVariants = (typeof customVariants)[number]

export type CustomBadgeStyles = Partial<{ [className in BadgeStylesNames]: CSSObject }>
type BadgeVariants = (theme: MantineTheme, params: BadgeStylesParams) => CustomBadgeStyles
