import { Card, Text, createStyles } from '@mantine/core'
import { useTranslation } from 'next-i18next'

const useStyles = createStyles((theme) => ({
	card: {
		width: '300px',
	},
	title: {
		fontWeight: theme.other.fontWeight.bold,
		textAlign: 'left',
		paddingBottom: theme.spacing.xs,
	},
	text: {
		fontWeight: theme.other.fontWeight.regular,
	},
}))

export const AntiHateMessage = () => {
	const { classes } = useStyles()
	const { t } = useTranslation()

	return (
		<Card className={classes.card} radius='lg' withBorder>
			<Text className={classes.title}>{t('anti-hate-title')}</Text>
			<Text className={classes.text}>{t('anti-hate-text')}</Text>
		</Card>
	)
}
