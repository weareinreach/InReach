import { Divider, List, type ListProps, useMantineTheme } from '@mantine/core'
import { Children, isValidElement, type ReactNode } from 'react'

import { useCustomVariant } from '~ui/hooks/useCustomVariant'

export const _BadgeGroup = ({ withSeparator, children, ...props }: BadgeGroupProps) => {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const variants = useCustomVariant()
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const theme = useMantineTheme()
	const separator = (
		<Divider w={4} size={4} style={{ borderRadius: '50%' }} color={theme.other.colors.secondary.black} />
	)

	return (
		<List
			variant={withSeparator ? variants.List.inlineBullet : variants.List.inline}
			icon={withSeparator ? separator : undefined}
			m={0}
			{...props}
		>
			{Children.map(children, (child, idx) => {
				const { key } = isValidElement(child) ? child : { key: idx }

				return <List.Item key={key}>{child}</List.Item>
			})}
		</List>
	)
}
_BadgeGroup.displayName = 'Badge.Group'

export interface BadgeGroupProps extends ListProps {
	withSeparator?: boolean
	children: ReactNode
}
