import { Group, Text } from '@mantine/core'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'

import { Icon, isValidIcon } from '~ui/icon'

export const SelectionItem = forwardRef<HTMLDivElement, SelectionItemProps>(
	({ icon, label, active, ...others }, ref) => {
		const { requireBoolean, requireGeo, requireData, requireLanguage, requireText, ...props } = others
		return (
			<Group
				sx={(theme) => ({
					alignItems: 'center',
					gap: theme.spacing.xs,
					padding: theme.spacing.xs,
					borderRadius: theme.radius.sm,
					// backgroundColor: theme.colors.gray[0],
					cursor: 'pointer',
					'&:hover': {
						backgroundColor: theme.other.colors.primary.lightGray,
					},
				})}
				ref={ref}
				{...props}
			>
				{icon && isValidIcon(icon) && <Icon icon={icon} width={18} />}
				{icon && !isValidIcon(icon) && <Text>{icon}</Text>}
				{label}
				{!active && <Icon icon='carbon:view-off' />}
			</Group>
		)
	}
)
SelectionItem.displayName = 'SelectionItem'
interface SelectionItemProps extends ComponentPropsWithoutRef<'div'> {
	icon?: string
	label: string
	requireBoolean: boolean
	requireGeo: boolean
	requireData: boolean
	requireLanguage: boolean
	requireText: boolean
	active: boolean
}
