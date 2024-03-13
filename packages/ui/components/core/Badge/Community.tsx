import { Badge, type BadgeProps, Text, Tooltip } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { forwardRef, type ReactNode } from 'react'

import { useCustomVariant } from '~ui/hooks/useCustomVariant'

import { useSharedStyles } from './styles'

export const _Community = forwardRef<HTMLDivElement, BadgeCommunityProps>(
	({ icon, hideTooltip, children, ...props }, ref) => {
		const { classes } = useSharedStyles('community')
		const { t } = useTranslation('common')
		const variants = useCustomVariant()

		const leftSection = icon

		const badge = (
			<Badge variant='outline' classNames={classes} ref={ref} leftSection={leftSection} {...props}>
				{typeof children === 'string' ? <Text fw={500}>{children}</Text> : children}
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
				label={t('badge.community-tool-tip', { ns: 'common' })}
			>
				{badge}
			</Tooltip>
		)
	}
)
_Community.displayName = 'Badge.Community'

export interface BadgeCommunityProps extends BadgeProps {
	/** Unicode emoji string */
	icon: string
	hideTooltip?: boolean
	children: ReactNode
}
