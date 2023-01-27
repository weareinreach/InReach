import { Card, Text, createStyles, Title } from '@mantine/core'
import { useTranslation } from 'next-i18next'

const useStyles = createStyles((theme) => ({
	text: {
		color: theme.other.colors.secondary.darkGray,
		marginBottom: 0,
		marginBlockEnd: 0,
	},
	title: {
		'&h3': {
			marginTop: '0',
		},
	},
}))

export const AntiHateMessage = () => {
	const { classes } = useStyles()
	const { t } = useTranslation()

	return (
		<Card radius='lg' withBorder p={20} w={300}>
			<Title order={3} className={classes.title}>
				{t('anti-hate-title')}
			</Title>
			<Text className={classes.text} component='p'>
				{t('anti-hate-text')}
			</Text>
		</Card>
	)
}
