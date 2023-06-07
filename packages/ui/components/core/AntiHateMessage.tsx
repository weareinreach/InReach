import { Card, createStyles, Modal, rem, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { setCookie } from 'cookies-next'
import { useTranslation } from 'next-i18next'

import { useCustomVariant } from '~ui/hooks'

import { Button } from './Button'

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

export const AntiHatePopup = ({ autoLaunch }: { autoLaunch: boolean }) => {
	const [opened, handler] = useDisclosure(autoLaunch)
	const variants = useCustomVariant()
	const { t } = useTranslation()
	const closeHandler = () => {
		setCookie('inr-ahpop', 'true', { maxAge: 60 * 60 * 24 * 30 })
		handler.close()
	}

	return (
		<Modal opened={opened} onClose={closeHandler} closeOnClickOutside={false} closeOnEscape={false} centered>
			<Stack spacing={24} align='center'>
				<AntiHateMessage noCard stacked />
				<Button variant={variants.Button.primaryLg} onClick={closeHandler} fullWidth>
					{t('words.accept')}
				</Button>
			</Stack>
		</Modal>
	)
}

export interface AntiHateMessageProps {
	noCard?: boolean
	stacked?: boolean
}
