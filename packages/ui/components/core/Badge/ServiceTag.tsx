import { Badge, type BadgeProps, Tooltip } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { forwardRef, type ReactNode } from 'react'

import { useCustomVariant } from '~ui/hooks/useCustomVariant'

import { useStyles } from './ServiceTag.styles'

export const _ServiceTag = forwardRef<HTMLDivElement, BadgeServiceTagProps>(
	({ hideTooltip, children, ...props }, ref) => {
		const { classes } = useStyles()
		const variants = useCustomVariant()
		const { t } = useTranslation(['common'])

		const badge = (
			<Badge classNames={classes} {...props} ref={ref}>
				{children}
			</Badge>
		)

		return hideTooltip ? (
			badge
		) : (
			<Tooltip
				multiline
				variant={variants.Tooltip.utility1}
				px={16}
				py={10}
				events={{ hover: true, focus: true, touch: true }}
				disabled={hideTooltip}
				label={t('badge.service-tool-tip')}
			>
				{badge}
			</Tooltip>
		)
	}
)
_ServiceTag.displayName = 'Badge.ServiceTag'

export interface BadgeServiceTagProps extends BadgeProps {
	children: ReactNode
	hideTooltip?: boolean
}
