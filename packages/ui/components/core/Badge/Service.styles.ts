import { createStyles, rem } from '@mantine/core'

export const useStyles = createStyles((theme) => ({
	root: {
		backgroundColor: theme.other.colors.primary.lightGray,
		borderColor: theme.other.colors.secondary.white,
	},
	inner: {
		fontSize: theme.fontSizes.sm,
		[theme.fn.largerThan('sm')]: {
			fontSize: theme.fontSizes.md,
		},
	},
}))
