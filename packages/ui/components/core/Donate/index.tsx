import { Affix, createStyles, Modal, Popover, rem, Text, useMantineTheme } from '@mantine/core'
import { useDisclosure, useTimeout, useViewportSize } from '@mantine/hooks'
import Script from 'next/script'
import { useTranslation } from 'next-i18next'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '~ui/components/core/Button'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useScreenSize } from '~ui/hooks/useScreenSize'
import { bounce } from '~ui/theme/animation'

const useStyles = createStyles((theme) => ({
	bounce: {
		animation: `${bounce(16)} 2s 5`,
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

export const Donate = () => {
	const [opened, handler] = useDisclosure(false)
	const { t } = useTranslation()
	const variant = useCustomVariant()
	const theme = useMantineTheme()
	const { classes, cx } = useStyles()
	const { isMobile } = useScreenSize()
	const donateEmoji = '💝'
	const [showEmoji, setShowEmoji] = useState(false)
	const { start } = useTimeout(() => {
		setShowEmoji(true)
	}, 10_000)
	const buttonPosition = isMobile ? { bottom: rem(100), right: rem(12) } : { bottom: rem(40), right: rem(40) }

	const buttonHandler = () => {
		if (isMobile) {
			if (!showEmoji || opened) {
				handler.close()
			}
		}
	}
	useEffect(() => {
		start()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	return (
		<Popover
			opened={!showEmoji || opened}
			withArrow
			position='top-end'
			closeOnClickOutside={false}
			closeOnEscape={false}
			keepMounted
			arrowPosition='center'
			arrowSize={12}
			middlewares={{ inline: true, shift: true, flip: false }}
		>
			<Popover.Target>
				<Affix position={buttonPosition}>
					<Button
						className={cx('kindful-donate-btn', classes.bounce, {
							[classes.shrink]: showEmoji,
						})}
						id='kindful-donate-btn-9e692b4a-fcfc-46a2-9a0e-4f9b8b0bd37b'
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
					<Script
						src='https://inreach.kindful.com/embeds/9e692b4a-fcfc-46a2-9a0e-4f9b8b0bd37b/init.js?type=button'
						data-embed-id='9e692b4a-fcfc-46a2-9a0e-4f9b8b0bd37b'
						data-lookup-type='jquery-selector'
						data-lookup-value='#kindful-donate-btn-9e692b4a-fcfc-46a2-9a0e-4f9b8b0bd37b'
						data-styles-off='true'
					/>
				</Affix>
			</Popover.Target>
			<Popover.Dropdown>
				<Text variant={variant.Text.utility1}>
					{t(showEmoji ? 'donation-hover-msg' : 'donation-popup-msg')}
				</Text>
			</Popover.Dropdown>
		</Popover>
	)
}

export const DonateModal = () => {
	const [opened, handler] = useDisclosure(false)
	const [modalOpened, modalHandler] = useDisclosure(false)
	const { t } = useTranslation()
	const variant = useCustomVariant()
	const theme = useMantineTheme()
	const { classes, cx } = useStyles()
	const { isMobile } = useScreenSize()
	const donateEmoji = '💝'
	const [showEmoji, setShowEmoji] = useState(false)
	const { start } = useTimeout(() => {
		setShowEmoji(true)
	}, 10_000)
	const buttonPosition = isMobile ? { bottom: rem(100), right: rem(12) } : { bottom: rem(40), right: rem(40) }

	const buttonHandler = () => {
		if (isMobile) {
			if (!showEmoji || opened) {
				handler.close()
				modalHandler.open()
			}
		} else {
			modalHandler.open()
		}
	}
	useEffect(() => {
		start()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<Popover
			opened={!showEmoji || opened}
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
		>
			<Popover.Target>
				<Affix position={buttonPosition}>
					<Button
						className={cx('kindful-donate-btn', classes.bounce, {
							[classes.shrink]: showEmoji,
						})}
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

					<Modal.Root
						opened={modalOpened}
						onClose={modalHandler.close}
						// withCloseButton
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
							>
								<Script
									src='https://inreach.kindful.com/embeds/9e692b4a-fcfc-46a2-9a0e-4f9b8b0bd37b/init.js?type=form'
									data-embed-id='9e692b4a-fcfc-46a2-9a0e-4f9b8b0bd37b'
									data-lookup-type='jquery-selector'
									data-lookup-value='#kindful-donate-form-9e692b4a-fcfc-46a2-9a0e-4f9b8b0bd37b'
									data-styles-off='true'
									strategy='lazyOnload'
								/>
							</Modal.Body>
						</Modal.Content>
					</Modal.Root>
				</Affix>
			</Popover.Target>
			<Popover.Dropdown>
				<Text variant={variant.Text.utility1}>
					{t(showEmoji ? 'donation-hover-msg' : 'donation-popup-msg')}
				</Text>
			</Popover.Dropdown>
		</Popover>
	)
}
