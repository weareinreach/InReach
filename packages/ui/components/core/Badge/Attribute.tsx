import { Badge, type BadgeProps, Text, useMantineTheme } from '@mantine/core'
import { forwardRef, type ReactNode } from 'react'

import { Icon, isValidIcon } from '~ui/icon'

import { useSharedStyles } from './styles'

export const _Attribute = forwardRef<HTMLDivElement, BadgeAttributeProps>(
	({ icon, children, ...props }, ref) => {
		const { classes } = useSharedStyles('attribute')
		const theme = useMantineTheme()

		const leftSection = isValidIcon(icon) ? (
			<Icon icon={icon} height={24} color={theme.other.colors.secondary.black} />
		) : null

		const badge = (
			<Badge variant='outline' classNames={classes} ref={ref} leftSection={leftSection} {...props}>
				{typeof children === 'string' ? <Text>{children}</Text> : children}
			</Badge>
		)

		return badge
	}
)
_Attribute.displayName = 'Badge.Attribute'

export interface BadgeAttributeProps extends BadgeProps {
	icon: string
	children: ReactNode
}
