import { Container, Grid, GridProps } from '@mantine/core'
import { StoryFn } from '@storybook/react'
import { ReactNode } from 'react'

export const BodyGrid = ({ children, ...others }: GridProps) => {
	return (
		<Container fluid>
			<Grid gutter={20} gutterXl={40} justify='center' {...others}>
				{children}
			</Grid>
		</Container>
	)
}

type BodyGridProps = {
	children: ReactNode
}

export const StorybookGrid = (Story: StoryFn) => (
	<BodyGrid pt={16}>
		<Story />
	</BodyGrid>
)
