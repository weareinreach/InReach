import { Box, Group, Text, useMantineTheme } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { forwardRef, useCallback } from 'react'

import { Button, type ButtonProps } from '~ui/components/core/Button'
import { useNewNotification } from '~ui/hooks'
import { Icon } from '~ui/icon'

import { useStyles } from './styles'

export const Share = forwardRef<HTMLButtonElement, ShareProps>(({ omitLabel, ...props }, ref) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const { t } = useTranslation('common')
	const { asPath } = useRouter()
	const href = `${window.location.origin}${asPath}`

	const clipboard = useClipboard({ timeout: 500 })
	const copiedToClipboard = useNewNotification({ icon: 'info', displayText: t('link-copied') })

	const handleCopy = useCallback(async () => {
		if (navigator.canShare instanceof Function && navigator?.canShare?.({ url: href })) {
			try {
				await navigator.share({ url: href })
			} catch {
				clipboard.copy(href)
				copiedToClipboard()
			}
		} else {
			clipboard.copy(href)
			copiedToClipboard()
		}
	}, [clipboard, copiedToClipboard, href])

	return (
		<Box component={Button} ref={ref} onClick={handleCopy} className={classes.button} {...props}>
			<Group spacing={0} noWrap>
				<Icon
					icon='carbon:share'
					color={theme.other.colors.secondary.black}
					className={classes.icon}
					height={24}
					width={24}
				/>
				{!omitLabel && <Text className={classes.text}>{t('words.share')}</Text>}
			</Group>
		</Box>
	)
})
Share.displayName = 'ActionButtons.Share'

export interface ShareProps extends ButtonProps {
	omitLabel?: boolean
}
