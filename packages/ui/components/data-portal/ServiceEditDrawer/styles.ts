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
	badgeGroup: {
		width: '100%',
		cursor: 'pointer',
		backgroundColor: theme.fn.lighten(theme.other.colors.secondary.teal, 0.9),
		borderRadius: rem(8),
		padding: rem(4),
	},
	tealText: {
		color: theme.other.colors.secondary.teal,
	},
	dottedCard: {
		border: `${rem(1)} dashed ${theme.other.colors.secondary.teal}`,
		borderRadius: rem(16),
		padding: rem(20),
	},
}))
