import { Group, Text, createStyles } from '@mantine/core'
import { useTranslation } from 'next-i18next'

import { Icon } from '~ui/icon'

const useStyles = createStyles(() => ({
	container: {
		width: 'auto',
	},
	icon: {
		height: '21px',
		width: '22px',
		fontSize: '20px',
	},
	text: {},
}))

export const Rating = ({ average, reviewCount }: Props) => {
	const { classes } = useStyles()
	const { t } = useTranslation('common')
	return (
		<Group position='center' spacing={5} className={classes.container}>
			<Icon icon='carbon:star-filled' className={classes.icon} />
			<Text className={classes.text}>
				{average} ({t('review-count', { count: reviewCount })})
			</Text>
		</Group>
	)
}

type Props = {
	average: number
	reviewCount: number
}
