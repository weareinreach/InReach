import { Affix, createStyles, Modal, Popover, rem, Text, useMantineTheme } from '@mantine/core'
import { useDisclosure, useTimeout } from '@mantine/hooks'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { useTranslation } from 'next-i18next'
import { useCallback, useEffect, useState } from 'react'

import { donateEvent } from '@weareinreach/analytics/events'
import { Button } from '~ui/components/core/Button'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useScreenSize } from '~ui/hooks/useScreenSize'
import { bounce } from '~ui/theme/animation'

const useStyles = createStyles((theme) => ({
	bounce: {
		animation: `${bounce(16)} 1.75s 5`,
	},
	shrink: {
		transition: `all 0.5s ease-in-out`,
		padding: '0 !important',
		borderRadius: '100% !important',
		width: rem(48),
	},
	modalBody: {
		padding: rem(0),
		[theme.fn.largerThan('xs')]: {
			padding: `${rem(0)} ${rem(0)}`,
		},
		[theme.fn.largerThan('sm')]: {
			padding: `${rem(0)} ${rem(0)}`,
		},
	},
}))

export const DonateModal = () => {
	const [opened, handler] = useDisclosure(false)
	const [modalOpened, modalHandler] = useDisclosure(false)
	const { t } = useTranslation()
	const router = useRouter()
	const variant = useCustomVariant()
	const theme = useMantineTheme()
	const { classes, cx } = useStyles()
	const { isMobile } = useScreenSize()
	const donateEmoji = '💝'
	const [showEmoji, setShowEmoji] = useState(false)
	const [isMobileApp, setIsMobileApp] = useState(false)
	const { start } = useTimeout(() => {
		setShowEmoji(true)
	}, 10_000)
	const buttonPosition = isMobile ? { bottom: rem(80), right: rem(12) } : { bottom: rem(40), right: rem(40) }

	const buttonHandler = useCallback(() => {
		donateEvent.click()
		if (isMobile) {
			if (!showEmoji || opened) {
				handler.close()
			}
			if (isMobileApp) {
				window.open(
					'https://inreach.kindful.com/embeds/9e692b4a-fcfc-46a2-9a0e-4f9b8b0bd37b',
					'_blank',
					'noopener'
				)
			} else {
				modalHandler.open()
			}
		} else {
			modalHandler.open()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	useEffect(() => {
		start()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	useEffect(() => {
		if (router.query.isMobileApp) {
			setIsMobileApp(true)
		}
	}, [router.query.isMobileApp])

	const isSupportPage = router.pathname === '/support'
	const isMainPage = router.pathname === '/'
	const showPopover = !(isSupportPage || isMainPage) && (opened || !showEmoji)

	return (
		<>
			<Popover
				opened={showPopover}
				withArrow
				position='top-end'
				closeOnClickOutside={false}
				closeOnEscape={false}
				keepMounted
				arrowPosition='center'
				arrowSize={12}
				middlewares={{ inline: true, shift: true, flip: false }}
				withinPortal
				// width={isMobile ? width - 40 : undefined}
				styles={{ dropdown: { maxWidth: '90vw', textAlign: 'center' } }}
				shadow='xl'
				zIndex={200}
			>
				<Popover.Target>
					<Affix
						position={buttonPosition}
						style={{ display: isSupportPage || isMainPage ? 'none' : undefined }}
					>
						<Button
							className={cx(
								// 'kindful-donate-btn',
								{ [classes.bounce]: !showEmoji },
								{
									[classes.shrink]: showEmoji,
								}
							)}
							variant={variant.Button.primarySm}
							bg={theme.other.colors.primary.allyGreen}
							styles={{
								inner: { color: theme.other.colors.secondary.black },
							}}
							onMouseEnter={handler.open}
							onMouseLeave={handler.close}
							onClick={buttonHandler}
						>
							{showEmoji ? donateEmoji : t('words.donate')}
						</Button>
					</Affix>
				</Popover.Target>
				<Popover.Dropdown>
					<Text variant={variant.Text.utility1}>{t(showEmoji ? 'donate.hover' : 'donate.popup')}</Text>
				</Popover.Dropdown>
			</Popover>
			<Modal.Root
				opened={modalOpened}
				onClose={modalHandler.close}
				styles={{ content: { minWidth: 'unset !important' } }}
				keepMounted
				fullScreen={isMobile}
			>
				<Modal.Overlay />
				<Modal.Content>
					<Modal.Header>
						<Modal.Title>
							<Text variant={variant.Text.utility1}>{t('words.donate')}</Text>
						</Modal.Title>
						<Modal.CloseButton />
					</Modal.Header>
					<Modal.Body
						id='kindful-donate-form-9e692b4a-fcfc-46a2-9a0e-4f9b8b0bd37b'
						className={cx('kindful-embed-wrapper', classes.modalBody)}
						style={{ paddingLeft: '0 !important', paddingRight: '0 !important' }}
					></Modal.Body>
				</Modal.Content>
			</Modal.Root>
			<Script
				src='https://inreach.kindful.com/embeds/9e692b4a-fcfc-46a2-9a0e-4f9b8b0bd37b/init.js?type=form'
				data-embed-id='9e692b4a-fcfc-46a2-9a0e-4f9b8b0bd37b'
				data-lookup-type='jquery-selector'
				data-lookup-value='#kindful-donate-form-9e692b4a-fcfc-46a2-9a0e-4f9b8b0bd37b'
				data-styles-off='true'
			/>
		</>
	)
}
