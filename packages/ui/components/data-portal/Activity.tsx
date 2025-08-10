import { createStyles, rem, Text } from '@mantine/core'

// Assuming you have a date formatting utility like this
const formatDate = (date: Date): string => {
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}

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
		flexWrap: 'wrap',
	},

	textBlock: {
		display: 'flex',
		flexDirection: 'column',
	},
}))

interface ActivityProps {
	lastUpdated: string | null
	lastVerified: string | null
	firstPublished: string | null
}

export const Activity = ({ lastUpdated, lastVerified, firstPublished }: ActivityProps) => {
	const { classes } = useMessageBodyStyles()
	return (
		<div className={classes.activityBlock}>
			<div className={classes.textBlock}>
				<Text className={classes.textStatus}>Last verified</Text>
				<Text className={classes.textDate}>{lastVerified ? formatDate(new Date(lastVerified)) : 'N/A'}</Text>
			</div>
			<div className={classes.textBlock}>
				<Text className={classes.textStatus}>Last updated</Text>
				<Text className={classes.textDate}>{lastUpdated ? formatDate(new Date(lastUpdated)) : 'N/A'}</Text>
			</div>
			<div className={classes.textBlock}>
				<Text className={classes.textStatus}>First published</Text>
				<Text className={classes.textDate}>
					{firstPublished ? formatDate(new Date(firstPublished)) : 'N/A'}
				</Text>
			</div>
		</div>
	)
}
