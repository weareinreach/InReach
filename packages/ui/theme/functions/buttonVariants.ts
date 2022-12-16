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
					padding: '6px 32px',
					height: '40px',
					gap: theme.spacing.xs,
					backgroundColor: theme.other.colors.secondary.black,
					'&:hover': {
						background: 'linear-gradient(0deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), #000000',
					},
				},
				inner: {
					color: theme.other.colors.secondary.white,
				},
				label: {
					top: '10 px',
					left: '32 px',
				},
				leftIcon: {
					display: 'none',
				},
			}
		case 'sm-secondary':
			return {
				root: {
					padding: '6px 32px',
					height: '40px',
					border: '1px solid',
					borderColor: theme.other.colors.tertiary.coolGray,
					backgroundColor: theme.other.colors.secondary.white,
					'&:hover': {
						backgroundColor: theme.other.colors.primary.lightGray,
					},
				},
				leftIcon: {
					display: 'none',
				},
			}
		case 'sm-accent':
			return {
				root: {
					padding: '6px 32px',
					height: '40px',
					backgroundColor: theme.other.colors.tertiary.red,
					'&:hover': {
						background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), #C05C4A',
					},
				},
				inner: {
					color: theme.colors.primaryText[0],
				},
				label: {
					lineHeight: '125%',
				},
				leftIcon: {
					display: 'none',
				},
			}
		case 'lg-primary':
			return {
				root: {
					padding: '6px 48px',
					gap: theme.spacing.sm,
					height: '48px',
					backgroundColor: theme.other.colors.secondary.black,
					borderRadius: theme.radius.md,
					'&:hover': {
						background: 'linear-gradient(0deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), #000000',
					},
				},
				inner: {
					color: theme.other.colors.secondary.white,
				},
			}
		case 'lg-secondary':
			return {
				root: {
					padding: '6px 48px',
					gap: theme.spacing.sm,
					height: '48px',
					border: '1px solid',
					borderColor: theme.other.colors.tertiary.coolGray,
					backgroundColor: theme.other.colors.secondary.white,
					borderRadius: theme.radius.md,
					'&:hover': {
						backgroundColor: theme.other.colors.primary.lightGray,
					},
				},
			}
		case 'lg-accent':
			return {
				root: {
					padding: '6px 48px',
					gap: theme.spacing.sm,
					height: '48px',
					backgroundColor: theme.colors.inReachSecondaryRegular[5],
					'&:hover': {
						background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), #4792DA',
					},
				},
				inner: {
					color: theme.colors.primaryText[0],
				},
				label: {
					lineHeight: '125%',
				},
			}
	}
	return {
		root: {},
		inner: {},
	}
}
