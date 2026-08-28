import { Card, Modal, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { setCookie } from 'cookies-next'
import { useTranslation } from 'next-i18next/pages'
import { useCallback } from 'react'

import { useCustomVariant, useScreenSize } from '~ui/hooks'

import classes from './AntiHateMessage.module.css'
import { Button } from './Button'

export const AntiHateMessage = ({ noCard, stacked }: AntiHateMessageProps) => {
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
		<Stack gap={16} align='center'>
			{title}
			{body}
		</Stack>
	) : (
		<Stack gap={12}>
			{title}
			{body}
		</Stack>
	)

	return noCard ? (
		content
	) : (
		<Card radius='lg' withBorder className={classes.card}>
			{content}
		</Card>
	)
}

export const AntiHatePopup = ({ autoLaunch }: { autoLaunch: boolean }) => {
	const [opened, handler] = useDisclosure(autoLaunch)
	const variants = useCustomVariant()
	const { t } = useTranslation()
	const { isMobile } = useScreenSize()
	const closeHandler = useCallback(() => {
		setCookie('inr-ahpop', 'true', { maxAge: 60 * 60 * 24 * 30 })
		handler.close()
	}, [handler])

	return (
		<Modal
			opened={opened}
			onClose={closeHandler}
			closeOnClickOutside={false}
			closeOnEscape={false}
			centered
			fullScreen={isMobile}
			classNames={{ content: classes.popupContent }}
		>
			<Stack gap={24} align='center'>
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
