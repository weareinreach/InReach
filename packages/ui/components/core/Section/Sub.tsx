import { Stack, type StackProps, Title } from '@mantine/core'
import { type ReactNode } from 'react'

export const _Sub = ({ title, children, ...props }: SubsectionProps) => {
	return (
		<Stack spacing={12} {...props}>
			{title && <Title order={3}>{title}</Title>}
			{children}
		</Stack>
	)
}
_Sub.displayName = 'Section.Sub'

interface SubsectionProps extends StackProps {
	title?: string
	children: ReactNode
}
