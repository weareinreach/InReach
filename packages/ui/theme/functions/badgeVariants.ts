import { BadgeVariant, CSSObject, MantineTheme } from '@mantine/core'

type BadgeVariants = (theme: MantineTheme, params: BadgeStylesParams) => Record<string, CSSObject>

type CustomVariants =
	| 'commmunityTag-large'
	| 'commmunityTag-small'
	| 'serviceTag-large'
	| 'serviceTag-small'
	| 'leader'
	| 'verified'
	| 'claimed'
	| 'unclaimed'

interface BadgeStylesParams {
	variant: BadgeVariant | CustomVariants
}

export const badgeVariants: BadgeVariants = (theme, params) => {
	switch (params.variant) {
		case 'commmunityTag-large':
			return {
				root: {
					height: theme.spacing.xl + 8,
					backgroundColor: theme.other.colors.secondary.white,
					borderColor: theme.other.colors.tertiary.coolGray
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
					marginRight: 0
				}
			}
		case 'commmunityTag-small':
			return {
				root: {
					height: theme.spacing.xl,
					backgroundColor: theme.other.colors.secondary.white,
					borderColor: theme.other.colors.tertiary.coolGray
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
					marginRight: 0
				}
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
			return {
			}
	}
}
