import { Group, Text } from '@mantine/core'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'

import { Icon, isValidIcon } from '~ui/icon'

export const SelectionItem = forwardRef<HTMLDivElement, SelectionItemProps>(
	({ icon, label, ...others }, ref) => {
		const { requireBoolean, requireGeo, requireData, requireLanguage, requireText, ...props } = others
		return (
			<div ref={ref} {...props}>
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
				>
					{icon && isValidIcon(icon) && <Icon icon={icon} width={18} />}
					{icon && !isValidIcon(icon) && <Text>{icon}</Text>}
					{label}
				</Group>
			</div>
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
}
