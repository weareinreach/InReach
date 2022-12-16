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
