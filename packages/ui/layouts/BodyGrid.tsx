import { Container, Grid, type GridProps } from '@mantine/core'
import { type StoryFn } from '@storybook/react'

export const BodyGrid = ({ children, className, ...others }: GridProps) => {
	return (
		<Container fluid className={className} my={40}>
			<Grid mb={400} {...others}>
				{children}
			</Grid>
		</Container>
	)
}

export const BodyGridNoTopMargin = ({ children, className, ...others }: GridProps) => {
	return (
		<Container fluid className={className}>
			<Grid {...others}>{children}</Grid>
		</Container>
	)
}

export const StorybookGrid = (Story: StoryFn) => (
	<BodyGrid pt={16}>
		<Story />
	</BodyGrid>
)

export const StorybookGridSingle = (Story: StoryFn) => (
	<BodyGrid pt={16}>
		<Grid.Col>
			<Story />
		</Grid.Col>
	</BodyGrid>
)
export const StorybookGridDouble = (Story: StoryFn) => (
	<BodyGrid pt={16}>
		<Grid.Col xs={12} sm={8}>
			<Story />
		</Grid.Col>
	</BodyGrid>
)
