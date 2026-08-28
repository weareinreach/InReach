import { Container, Grid, type GridProps } from '@mantine/core'
import { type StoryFn } from '@storybook/nextjs'
import { type ComponentType } from 'react'

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

export const StorybookGrid = (Story: StoryFn) => {
	const StoryComponent = Story as ComponentType
	return (
		<BodyGrid pt={16}>
			<StoryComponent />
		</BodyGrid>
	)
}

export const StorybookGridSingle = (Story: StoryFn) => {
	const StoryComponent = Story as ComponentType
	return (
		<BodyGrid pt={16}>
			<Grid.Col>
				<StoryComponent />
			</Grid.Col>
		</BodyGrid>
	)
}
export const StorybookGridDouble = (Story: StoryFn) => {
	const StoryComponent = Story as ComponentType
	return (
		<BodyGrid pt={16}>
			<Grid.Col span={{ base: 12, sm: 8 }}>
				<StoryComponent />
			</Grid.Col>
		</BodyGrid>
	)
}
