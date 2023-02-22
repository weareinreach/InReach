import { Group, Text, createStyles } from '@mantine/core'
import { useTranslation } from 'next-i18next'

import { Icon } from '~ui/icon'

const useStyles = createStyles((theme) => ({
	container: {
		width: 'auto',
	},
	icon: {},
	text: {
		...theme.other.utilityFonts.utility1,
	},
}))

export const Rating = ({ average, reviewCount, showCount = true }: Props) => {
	const { classes } = useStyles()
	const { t } = useTranslation('common')

	const noReviews = reviewCount === 0

	return (
		<Group position='center' spacing={5} className={classes.container}>
			<Icon icon='carbon:star-filled' className={classes.icon} height={24} />
			{noReviews ? (
				<Text className={classes.text}>{t('no-reviews')}</Text>
			) : (
				<Text className={classes.text}>
					{average} {showCount && `(${t('review-count', { count: reviewCount })})`}
				</Text>
			)}
		</Group>
	)
}

type Props = {
	average: number
	reviewCount: number
	showCount?: boolean
}
