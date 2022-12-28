import { ActionIconVariant, CSSObject, MantineTheme } from '@mantine/core'

type ActionIconVariants = (theme: MantineTheme, params: ActionIconStylesParams) => Record<string, CSSObject>

export const approvedIcons = {
	twitter: 'fe:twitter',
} as const

interface ActionIconStylesParams {
	component: string
	href: string
	variant: ActionIconVariant
	icon: typeof approvedIcons
	radius: string
}

export const actionIconVariants: ActionIconVariants = (theme, params) => {
	switch (params.variant) {
		case 'subtle':
			return {
				root: {
					width: '32px',
					height: '32px',
				},
				inner: {},
				// root:{
				// 	height: theme.spacing.lg * 2,
				// 	padding: theme.spacing.lg,
				// 	'&:hover': {
				// 		borderRadius:"xl",
				// 		padding: theme.spacing.lg,
				// 	},

				// },
				// inner:{
				// 	padding: theme.spacing.lg,
				// 	color: theme.other.colors.secondary.white
				// 	},
			}
		case 'filled':
			return {
				root: {
					width: '32px',
					height: '32px',
				},
				inner: {},
				// root:{
				// 	height: theme.spacing.lg * 2,
				// 	padding: theme.spacing.lg,
				// 	'&:hover': {
				// 		borderRadius:"xl",
				// 		padding: theme.spacing.lg,
				// 	},
				// },
				// inner:{
				// 	padding: theme.spacing.lg,
				// },
			}
		default: {
			return {
				root: {},
				inner: {},
			}
		}
	}
}
