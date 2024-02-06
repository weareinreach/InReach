import { createStyles, rem } from '@mantine/core'

export const useStyles = createStyles((theme) => ({
	drawerContent: {
		borderRadius: `${rem(32)} 0 0 0`,
		minWidth: '40vw',
	},
	drawerBody: {
		padding: `${rem(40)} ${rem(32)}`,
		'&:not(:only-child)': {
			paddingTop: rem(40),
		},
	},
	addNewButton: {
		width: '100%',
		border: `${rem(1)} dashed ${theme.other.colors.secondary.teal}`,
		borderRadius: rem(8),
		padding: rem(12),
	},
	addNewText: {
		color: theme.other.colors.secondary.teal,
	},
	overlay: {
		backgroundColor: theme.fn.lighten(theme.other.colors.secondary.teal, 0.9),
		borderRadius: rem(16),
		margin: rem(-4),
		padding: rem(4),
		...theme.fn.hover({ cursor: 'pointer' }),
	},
}))
