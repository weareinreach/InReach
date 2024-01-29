import { Badge, type BadgeProps, Text, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { forwardRef } from 'react'

import { Icon } from '~ui/icon'

import { useSharedStyles } from './styles'

export const _VerifiedReviewer = forwardRef<HTMLDivElement, BadgeVerifiedReviewerProps>(
	({ hideTooltip, ...props }, ref) => {
		const { classes } = useSharedStyles('verifiedReviewer')
		const theme = useMantineTheme()
		const { t } = useTranslation(['common'])

		const leftSection = (
			<Icon icon='carbon:checkmark-filled' height={20} color={theme.other.colors.primary.allyGreen} />
		)

		const badge = (
			<Badge variant='outline' classNames={classes} ref={ref} leftSection={leftSection} {...props}>
				<Text>{t('badge.verified-reviewer')}</Text>
			</Badge>
		)

		return badge
	}
)
_VerifiedReviewer.displayName = 'Badge.VerifiedReviewer'

export interface BadgeVerifiedReviewerProps extends BadgeProps {
	hideTooltip?: boolean
}
