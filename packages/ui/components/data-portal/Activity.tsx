import { Text } from '@mantine/core'

import classes from './Activity.module.css'

// Assuming you have a date formatting utility like this
const formatDate = (date: Date): string => {
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}

interface ActivityProps {
	lastUpdated: string | null
	lastVerified: string | null
	firstPublished: string | null
}

export const Activity = ({ lastUpdated, lastVerified, firstPublished }: ActivityProps) => {
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
