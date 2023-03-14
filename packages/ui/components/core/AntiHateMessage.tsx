import { Card, Text, createStyles, Title } from '@mantine/core'
import { useTranslation } from 'next-i18next'

const useStyles = createStyles((theme) => ({
	text: {
		color: theme.other.colors.secondary.darkGray,
	},
}))

export const AntiHateMessage = () => {
	const { classes } = useStyles()
	const { t } = useTranslation()

	return (
		<Card radius='lg' withBorder p={20}>
			<Title order={3}>{t('anti-hate-title')}</Title>
			<Text className={classes.text} component='p'>
				{t('anti-hate-text')}
			</Text>
		</Card>
	)
}
