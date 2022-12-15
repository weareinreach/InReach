import { ButtonVariant, CSSObject, Flex, MantineTheme } from '@mantine/core'

type ButtonVariants = (theme: MantineTheme, params: ButtonStylesParams) => Record<string, CSSObject>

type CustomVariants = 'lg-primary' | 'lg-secondary' | 'lg-accent'

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
		case 'lg-primary':
			return {
				root: {
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: '#000000',
					borderRadius: theme.radius.md,
					padding: '6px 48px',
					gap: theme.spacing.sm,
					width: 'hug',
					height: '48px',
					left: theme.spacing.lg,
					top: theme.spacing.lg,

					'&:hover': {
						background: 'linear-gradient(0deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), #000000',
					},
				},
				inner: {
					color: '#ffffff',
					fontWeight: '500',
					size: theme.fontSizes.md,
				},
				label: {
					textTransform: 'none',
					width: 'hug',
					height: 'hug',
					top: '14px',
					left: '80px',
				},
				leftIcon: {
					height: '24px',
					width: theme.spacing.lg,
				},
			}
		case 'lg-secondary':
			return {
				root: {
					border: '1px solid #d9d9d9',
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: '#FFFFFF',
					borderRadius: theme.radius.md,
					padding: '6px 48px',
					gap: theme.spacing.sm,
					width: 'hug',
					height: '48px',
					left: theme.spacing.lg,
					top: theme.spacing.lg,

					'&:hover': {
						background: '#EFEFEF',
					},
				},
				inner: {
					color: '#000000',
					fontWeight: '500',
					size: theme.fontSizes.md,
				},
				label: {
					textTransform: 'none',
					width: 'hug',
					height: 'hug',
					top: '14px',
					left: '80px',
				},
				leftIcon: {
					height: '24px',
					width: theme.spacing.lg,
				},
			}
		case 'lg-accent':
			return {
				root: {
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: theme.colors.inReachSecondaryRegular[5],
					borderRadius: theme.radius.xl,
					padding: '6px 48px',
					gap: theme.spacing.sm,
					width: 'hug',
					height: '48px',
					left: theme.spacing.lg,
					top: theme.spacing.lg,

					'&:hover': {
						background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), #4792DA;',
					},
				},
				inner: {
					color: theme.colors.primaryText[0],
					fontWeight: '500',
					fontSize: theme.fontSizes.md,
				},
				label: {
					textTransform: 'none',
					width: 'hug',
					height: 'hug',
					top: '14px',
					left: '80px',
					lineHeight: '125%',
				},
				leftIcon: {
					height: '24px',
					width: theme.spacing.lg,
				},
			}
	}
	return {
		root: {},
		inner: {},
	}
}
