import { Text, useMantineTheme } from '@mantine/core'

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
	const theme = useMantineTheme()

	// The theme's global `Text` override (`theme/common.tsx`) sets `fontWeight`/`color` as an inline
	// style on every plain `Text`, which beats a CSS module class's own (non-`!important`)
	// declarations regardless of specificity - `classes.textStatus`/`classes.textDate` alone were
	// silently losing that fight, rendering both label and value at the same default weight/color.
	// Passing `fw`/`c` as props here wins over the theme override too, per that file's own comment.
	return (
		<div className={classes.activityBlock}>
			<div className={classes.textBlock}>
				<Text size='sm' fw={theme.other.fontWeight.bold} c={theme.other.colors.secondary.black}>
					Last verified
				</Text>
				<Text size='sm' fw={theme.other.fontWeight.regular} c={theme.other.colors.secondary.darkGray}>
					{lastVerified ? formatDate(new Date(lastVerified)) : 'N/A'}
				</Text>
			</div>
			<div className={classes.textBlock}>
				<Text size='sm' fw={theme.other.fontWeight.bold} c={theme.other.colors.secondary.black}>
					Last updated
				</Text>
				<Text size='sm' fw={theme.other.fontWeight.regular} c={theme.other.colors.secondary.darkGray}>
					{lastUpdated ? formatDate(new Date(lastUpdated)) : 'N/A'}
				</Text>
			</div>
			<div className={classes.textBlock}>
				<Text size='sm' fw={theme.other.fontWeight.bold} c={theme.other.colors.secondary.black}>
					First published
				</Text>
				<Text size='sm' fw={theme.other.fontWeight.regular} c={theme.other.colors.secondary.darkGray}>
					{firstPublished ? formatDate(new Date(firstPublished)) : 'N/A'}
				</Text>
			</div>
		</div>
	)
}
