import { createStyles } from '@mantine/core'

export const useStyles = createStyles((theme) => ({
	sectionDivider: {
		backgroundColor: theme.other.colors.primary.lightGray,
		padding: 12,
	},
	timezone: {
		...theme.other.utilityFonts.utility4,
		color: theme.other.colors.secondary.darkGray,
	},
	blackText: {
		color: '#000000',
		margin: 0,
		whiteSpace: 'pre-line',
	},
}))
