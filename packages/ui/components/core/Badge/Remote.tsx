import { Badge, type BadgeProps, Tooltip, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { forwardRef } from 'react'

import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'

import { useSharedStyles } from './styles'

export const _Remote = forwardRef<HTMLDivElement, BadgeRemoteProps>(({ hideTooltip, ...props }, ref) => {
	const { classes } = useSharedStyles('remote')
	const theme = useMantineTheme()
	const { t } = useTranslation(['common'])
	const variants = useCustomVariant()

	const leftSection = <Icon icon='carbon:globe' height={20} color={theme.other.colors.secondary.black} />

	const badge = (
		<Badge variant='outline' classNames={classes} ref={ref} leftSection={leftSection} {...props}></Badge>
	)
	const tooltipProps = {
		label: t('badge.remote-tool-tip'),
		multiline: true,
		maw: { base: '90vw', xs: 600 },
		variant: variants.Tooltip.utility1,
	}

	return <Tooltip {...tooltipProps}>{badge}</Tooltip>
})
_Remote.displayName = 'Badge.Remote'

export interface BadgeRemoteProps extends BadgeProps {
	hideTooltip?: boolean
}
