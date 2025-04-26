import { createStyles, rem, Text } from '@mantine/core'

const useMessageBodyStyles = createStyles((theme) => ({
	textDate: {
		fontSize: rem(12),
		fontWeight: 400,
		color: theme.other.colors.secondary.darkGray,
	},

	textStatus: {
		fontSize: rem(16),
		fontWeight: 500,
	},
	activityBlock: {
		display: 'flex',
		gap: rem(16),
		paddingLeft: rem(20),
		paddingRight: rem(20),
	},

	textBlock: {
		display: 'flex',
		flexDirection: 'column',
	},
}))
export const Activity = () => {
	const { classes } = useMessageBodyStyles()

	return (
		<div className={classes.activityBlock}>
			<div className={classes.textBlock}>
				<Text className={classes.textStatus}>Last verified</Text>
				<Text className={classes.textDate}>Coming Soon</Text>
			</div>
			<div className={classes.textBlock}>
				<Text className={classes.textStatus}>Last updated</Text>
				<Text className={classes.textDate}>Coming Soon</Text>
			</div>
			<div className={classes.textBlock}>
				<Text className={classes.textStatus}>First published</Text>
				<Text className={classes.textDate}>Coming Soon</Text>
			</div>
		</div>
	)
}
