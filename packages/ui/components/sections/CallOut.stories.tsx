import { Title, Stack, Grid } from '@mantine/core'
import { Meta, StoryObj } from '@storybook/react'

import { StorybookGrid } from '~ui/layouts/BodyGrid'

import { CallOut } from './CallOut'

export default {
	title: 'Sections/CallOut',
	component: CallOut,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/9kGFZSfpdKIQydMrFKhlWi/Search-Landing-Page-Redesign?node-id=18%3A216&t=a1NHmzcT1shhofwn-4',
		},
		layout: 'fullscreen',
	},
	args: {
		children: (
			<Stack align='center'>
				<Title order={1}>Heading Text</Title>
				<Title order={2}>
					text text text text text text text text text text text text text text text text text
				</Title>
			</Stack>
		),
		backgroundColor: '#79ADD7',
	},
	decorators: [StorybookGrid],
} satisfies Meta<typeof CallOut>

type StoryDef = StoryObj<typeof CallOut>

export const Default = {} satisfies StoryDef
