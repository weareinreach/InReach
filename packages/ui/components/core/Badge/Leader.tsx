import { Badge, type BadgeProps, ColorSwatch, Text, Tooltip } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { forwardRef, type ReactNode } from 'react'

import { useCustomVariant } from '~ui/hooks/useCustomVariant'

import { useSharedStyles } from './styles'

export const _Leader = forwardRef<HTMLDivElement, BadgeLeaderProps>(
	({ iconBg, icon, minify, hideBg, hideTooltip, children, ...props }, ref) => {
		const { classes } = useSharedStyles('leader')
		const { t } = useTranslation('common')
		const variants = useCustomVariant()

		const leftSection = (
			<ColorSwatch color={iconBg} radius={24} size={24}>
				<span>{icon}</span>
			</ColorSwatch>
		)

		const badge = (
			<Badge
				variant='outline'
				classNames={classes}
				ref={ref}
				leftSection={leftSection}
				{...props}
				{...(minify ? { 'data-minify': true } : {})}
				{...(hideBg ? { 'data-hidebg': true } : {})}
			>
				{minify ? null : <Text fw={500}>{children}</Text>}
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
				label={t('adjective.organization', { ns: 'common', adjective: children })}
				disabled={!minify}
			>
				{badge}
			</Tooltip>
		)
	}
)
_Leader.displayName = 'Badge.Leader'

export interface BadgeLeaderProps extends BadgeProps {
	/** Background color for icon */
	iconBg: string
	/** Unicode emoji string */
	icon: string
	/** Show icon only? */
	minify?: boolean
	/** Hide light gray bg for mini */
	hideBg?: boolean
	hideTooltip?: boolean
	children: ReactNode
}
