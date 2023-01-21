import { Center } from '@mantine/core'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { InstantFeedback as InstantFeedbackCompnent } from './InstantFeedback'

export default {
	title: 'Design System/Instant Feedback',
	component: InstantFeedbackCompnent,
	decorators: [
		(Story) => (
			<Center style={{ width: '100vw' }}>
				<Story />
			</Center>
		),
	],
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=70%3A2310&t=gF8uAWa4xEOPSNAI-0',
		},
	},
} as ComponentMeta<typeof InstantFeedbackCompnent>

const InstantFeedback: ComponentStory<typeof InstantFeedbackCompnent> = (args) => <InstantFeedbackCompnent {...args} />

export const InstantFeedbackNotification = InstantFeedback.bind({})

InstantFeedbackNotification.args = {
    link: "#"
}