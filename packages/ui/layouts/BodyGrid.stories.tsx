import { Box, Grid } from '@mantine/core'
import { type Meta, type StoryObj } from '@storybook/nextjs'
import React from 'react'

import { BodyGrid as BodyGridComponent } from './BodyGrid'
import classes from './BodyGrid.stories.module.css'

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
				<Grid.Col key={i}>
					<Box className={classes.demoBox}>{i + 1}</Box>
				</Grid.Col>
			)
		}
		return <BodyGridComponent>{columns}</BodyGridComponent>
	},
}

export default Story
