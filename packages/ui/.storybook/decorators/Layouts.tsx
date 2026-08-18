import { Center, Grid } from '@mantine/core'
import { type StoryContext, type StoryFn } from '@storybook/nextjs'
import { type ComponentType } from 'react'

import { BodyGrid } from '~ui/layouts/BodyGrid'

export type LayoutsDecorator = 'centeredFullscreen' | 'centeredHalf' | 'gridSingle' | 'gridDouble'
export const Layouts = (Story: StoryFn, context: StoryContext) => {
	const { layoutWrapper } = context.parameters
	const StoryComponent = Story as ComponentType

	if (!layoutWrapper) return <StoryComponent />

	switch (layoutWrapper) {
		case 'centeredFullscreen': {
			return (
				<Center h='100vh' w='100vw'>
					<StoryComponent />
				</Center>
			)
		}
		case 'centeredHalf': {
			return (
				<Center h='50vh'>
					<StoryComponent />
				</Center>
			)
		}
		case 'gridSingle': {
			return (
				<BodyGrid pt={16}>
					<Grid.Col>
						<StoryComponent />
					</Grid.Col>
				</BodyGrid>
			)
		}
		case 'gridDouble': {
			return (
				<BodyGrid pt={16}>
					<Grid.Col xs={12} sm={8}>
						<StoryComponent />
					</Grid.Col>
				</BodyGrid>
			)
		}
	}
}
