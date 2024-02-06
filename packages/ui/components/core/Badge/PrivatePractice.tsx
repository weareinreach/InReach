import { Badge, type BadgeProps, Text, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { forwardRef } from 'react'

import { Icon } from '~ui/icon'

import { useSharedStyles } from './styles'

export const _PrivatePractice = forwardRef<HTMLDivElement, BadgePrivatePracticeProps>(
	({ hideTooltip, ...props }, ref) => {
		const { classes } = useSharedStyles('privatePractice')
		const theme = useMantineTheme()
		const { t } = useTranslation('common')

		const leftSection = (
			<Icon icon='carbon:location-person-filled' color={theme.other.colors.tertiary.pink} height={24} />
		)

		const badge = (
			<Badge variant='outline' classNames={classes} ref={ref} leftSection={leftSection} {...props}>
				<Text>{t('badge.privatePractice')}</Text>
			</Badge>
		)

		return badge
	}
)
_PrivatePractice.displayName = 'Badge.PrivatePractice'

export interface BadgePrivatePracticeProps extends BadgeProps {
	hideTooltip?: boolean
}
