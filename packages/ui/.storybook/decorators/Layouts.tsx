import { Center, Grid } from '@mantine/core'
import { type StoryContext, type StoryFn } from '@storybook/react'

import { BodyGrid } from '~ui/layouts/BodyGrid'

export type LayoutsDecorator = 'centeredFullscreen' | 'centeredHalf' | 'gridSingle' | 'gridDouble'
export const Layouts = (Story: StoryFn, context: StoryContext) => {
	const { layoutWrapper } = context.parameters

	if (!layoutWrapper) return <Story />

	switch (layoutWrapper) {
		case 'centeredFullscreen': {
			return (
				<Center h='100vh' w='100vw'>
					<Story />
				</Center>
			)
		}
		case 'centeredHalf': {
			return (
				<Center h='50vh'>
					<Story />
				</Center>
			)
		}
		case 'gridSingle': {
			return (
				<BodyGrid pt={16}>
					<Grid.Col>
						<Story />
					</Grid.Col>
				</BodyGrid>
			)
		}
		case 'gridDouble': {
			return (
				<BodyGrid pt={16}>
					<Grid.Col xs={12} sm={8}>
						<Story />
					</Grid.Col>
				</BodyGrid>
			)
		}
	}
}
