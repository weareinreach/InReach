import { ButtonVariant, CSSObject, Flex, MantineTheme } from '@mantine/core'

type ButtonVariants = (theme: MantineTheme, params: ButtonStylesParams) => Record<string, CSSObject>

type CustomVariants =
	| 'sm-primary'
	| 'sm-secondary'
	| 'sm-accent'
	| 'lg-primary'
	| 'lg-secondary'
	| 'lg-accent'
interface ButtonStylesParams {
	variant: ButtonVariant | CustomVariants
}

export const buttonVariants: ButtonVariants = (theme, params) => {
	switch (params.variant) {
		case 'filled':
			return {
				root: {
					backgroundColor: theme.colors.inReachPrimaryRegular[5],
					'&:hover': {
						backgroundColor: theme.colors.inReachPrimaryHover[5],
					},
				},
				inner: {},
			}
		case 'outline':
			return {
				root: {
					outlineColor: theme.colors.inReachPrimaryRegular[5],
					'&:hover': {
						outlineColor: theme.colors.inReachPrimaryHover[5],
					},
				},
				inner: {},
			}

		case 'sm-primary':
			return {
				root: {
					paddingTop: theme.spacing.sm / 2,
					paddingBottom: theme.spacing.sm / 2,
					paddingLeft: theme.spacing.md * 2,
					paddingRight: theme.spacing.md * 2,
					height: theme.spacing.lg * 2,
					gap: theme.spacing.xs,
					'&:hover': {
						background: 'linear-gradient(0deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), #000000',
					},
				},
				inner: {
					color: theme.other.colors.secondary.white,
				},
				label: {
					left: theme.spacing.md * 2,
				},
				leftIcon: {
					display: 'none',
				},
			}
		case 'sm-secondary':
			return {
				root: {
					paddingTop: theme.spacing.sm / 2,
					paddingBottom: theme.spacing.sm / 2,
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
				},
				label: {
					left: theme.spacing.md * 2,
				},
				leftIcon: {
					display: 'none',
				},
			}
		case 'sm-accent':
			return {
				root: {
					paddingTop: theme.spacing.sm / 2,
					paddingBottom: theme.spacing.sm / 2,
					paddingLeft: theme.spacing.md * 2,
					paddingRight: theme.spacing.md * 2,
					height: theme.spacing.lg * 2,
					backgroundColor: theme.other.colors.tertiary.red,
					'&:hover': {
						background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), #C05C4A',
					},
				},
				inner: {
					color: theme.colors.primaryText[0],
				},
				label: {
					left: theme.spacing.md * 2,
				},
				leftIcon: {
					display: 'none',
				},
			}
		case 'lg-primary':
			return {
				root: {
					borderRadius: theme.radius.md,
					'&:hover': {
						background: 'linear-gradient(0deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), #000000',
					},
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
						background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), #4792DA',
					},
				},
			}
	}
	return {
		root: {},
		inner: {},
	}
}
