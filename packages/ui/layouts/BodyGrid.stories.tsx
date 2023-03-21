import { Box, Grid } from '@mantine/core'
import { Meta, StoryObj } from '@storybook/react'
import React from 'react'

import { BodyGrid as BodyGridComponent } from './BodyGrid'

const Story: Meta<typeof BodyGridComponent> = {
	title: 'App/Layout/Body',
	component: BodyGridComponent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=251%3A4812&t=M5Oy40La13DvdH8D-4',
		},
		layout: 'fullscreen',
	},
}

export const BodyGrid: StoryObj<typeof BodyGridComponent> = {
	render: () => {
		const columns = []
		for (let i = 0; i < 6; i++) {
			columns.push(
				<Grid.Col>
					<Box
						sx={(theme) => ({
							backgroundColor: theme.other.colors.tertiary.lightBlue,
							height: '35vh',
							textAlign: 'center',
						})}
					>
						{i + 1}
					</Box>
				</Grid.Col>
			)
		}
		return <BodyGridComponent>{columns}</BodyGridComponent>
	},
}

export default Story
