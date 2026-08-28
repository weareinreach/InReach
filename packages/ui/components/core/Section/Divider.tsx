import { Box, Stack, type StackProps, Title } from '@mantine/core'
import { type ReactNode } from 'react'

import classes from './Divider.module.css'

export const _Divider = ({ title, children, ...props }: SectionProps) => {
	if (!children || (Array.isArray(children) && children.length === 0)) return null

	return (
		<Stack gap={24} w='100%' {...props}>
			<Box className={classes.sectionDivider}>
				<Title order={3} fw={600}>
					{title}
				</Title>
			</Box>
			{children}
		</Stack>
	)
}
_Divider.displayName = 'Section.Divider'

interface SectionProps extends StackProps {
	title?: string
	children: ReactNode
}
