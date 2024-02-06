import { createStyles, rem } from '@mantine/core'

export const useStyles = createStyles((theme) => ({
	overlay: {
		backgroundColor: theme.fn.lighten(theme.other.colors.secondary.teal, 0.9),
		borderRadius: rem(16),
		margin: rem(-8),
		padding: rem(8),
		...theme.fn.hover({
			cursor: 'pointer',
		}),
	},
}))
