import { Card, createStyles, rem, Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'next-i18next'

const useStyles = createStyles((theme) => ({
	text: {
		color: theme.other.colors.secondary.darkGray,
	},
	card: {
		padding: `${rem(20)} !important`,
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
		<Text className={classes.text} component='p' m={0} ta={stacked ? 'center' : undefined}>
			{t('anti-hate.body')}
		</Text>
	)

	const content = stacked ? (
		<Stack spacing={16} align='center'>
			{title}
			{body}
		</Stack>
	) : (
		<Stack spacing={12}>
			{title}
			{body}
		</Stack>
	)

	return noCard ? (
		content
	) : (
		<Card radius='lg' withBorder classNames={{ root: classes.card }}>
			{content}
		</Card>
	)
}

export interface AntiHateMessageProps {
	noCard?: boolean
	stacked?: boolean
}
