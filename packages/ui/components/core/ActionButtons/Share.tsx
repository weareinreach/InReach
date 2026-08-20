import { Box, Group, Text, useMantineTheme } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { forwardRef, useCallback } from 'react'

import { Button, type ButtonProps } from '~ui/components/core/Button'
import { useNewNotification } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { cx } from '~ui/lib/cx'

import classes from './styles.module.css'

export const Share = forwardRef<HTMLButtonElement, ShareProps>(({ omitLabel, className, ...props }, ref) => {
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
		<Box
			component={Button}
			ref={ref}
			onClick={handleCopy}
			className={cx(classes.button, className)}
			{...props}
		>
			<Group gap={0} wrap='nowrap'>
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
