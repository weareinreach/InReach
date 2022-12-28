import { ActionIconVariant, CSSObject, MantineTheme } from '@mantine/core'

type ActionIconVariants = (theme: MantineTheme, params: ActionIconStylesParams) => Record<string, CSSObject>

const approvedIcons = {
	twitter: 'teenyicons:twitter-solid',
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
				root: {},
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
				root: {},
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
