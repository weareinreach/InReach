import { Badge, type BadgeProps, Text, Tooltip, useMantineTheme } from '@mantine/core'
import { DateTime } from 'luxon'
import { useTranslation } from 'next-i18next'
import { forwardRef } from 'react'

import { Icon } from '~ui/icon'

import { useSharedStyles } from './styles'

export const _Verified = forwardRef<HTMLDivElement, BadgeVerifiedProps>(
	({ hideTooltip, lastverified, ...props }, ref) => {
		const { classes } = useSharedStyles('verified')
		const theme = useMantineTheme()
		const { t, i18n } = useTranslation('common')

		const leftSection = (
			<Icon icon='carbon:checkmark-filled' color={theme.other.colors.primary.allyGreen} height={20} />
		)

		const badge = (
			<Badge variant='outline' classNames={classes} ref={ref} leftSection={leftSection} {...props}>
				<Text>{t('badge.verified-information')}</Text>
			</Badge>
		)
		const dateDisplay = lastverified instanceof Date ? lastverified : new Date(lastverified)
		const dateString = DateTime.fromJSDate(dateDisplay)
			.setLocale(i18n.resolvedLanguage ?? 'en')
			.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
		const label = t('badge.verified-information-detail', { dateString })

		const tooltipProps = {
			label,
			multiline: true,
			maw: { base: '90vw', xs: 600 },
		}

		return hideTooltip ? (
			badge
		) : (
			<Tooltip events={{ hover: true, focus: true, touch: true }} disabled={hideTooltip} {...tooltipProps}>
				{badge}
			</Tooltip>
		)
	}
)
_Verified.displayName = 'Badge.Verified'

export interface BadgeVerifiedProps extends BadgeProps {
	hideTooltip?: boolean
	lastverified: Date | string
}
