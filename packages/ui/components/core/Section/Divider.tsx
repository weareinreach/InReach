import { Box, createStyles, rem, Stack, type StackProps, Title } from '@mantine/core'
import { type ReactNode } from 'react'

const useStyles = createStyles((theme) => ({
	sectionDivider: {
		backgroundColor: theme.other.colors.primary.lightGray,
		padding: rem(12),
	},
}))

export const _Divider = ({ title, children, ...props }: SectionProps) => {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const { classes } = useStyles()
	if (!children || (Array.isArray(children) && children.length === 0)) return null

	return (
		<Stack spacing={24} w='100%' {...props}>
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
