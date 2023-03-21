import { Card, Text, createStyles, Title, Stack } from '@mantine/core'
import { useTranslation } from 'next-i18next'

const useStyles = createStyles((theme) => ({
	text: {
		color: theme.other.colors.secondary.darkGray,
	},
}))

export const AntiHateMessage = ({ noCard, stacked }: AntiHateMessageProps) => {
	const { classes } = useStyles()
	const { t } = useTranslation()

	const title = stacked ? (
		<>
			<Title order={1}>🏳️‍🌈</Title>
			<Title order={2}>{t('anti-hate.title')}</Title>
		</>
	) : (
		<Title order={3}>{`🏳️‍🌈 ${t('anti-hate.title')}`}</Title>
	)
	const body = (
		<Text className={classes.text} component='p' ta={stacked ? 'center' : undefined}>
			{t('anti-hate.body')}
		</Text>
	)

	const content = stacked ? (
		<Stack spacing={16} align='center'>
			{title}
			{body}
		</Stack>
	) : (
		<>
			{title}
			{body}
		</>
	)

	return noCard ? (
		content
	) : (
		<Card radius='lg' withBorder p={20}>
			{content}
		</Card>
	)
}

export interface AntiHateMessageProps {
	noCard?: boolean
	stacked?: boolean
}
