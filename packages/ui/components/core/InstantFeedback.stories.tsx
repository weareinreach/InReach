import { Center } from '@mantine/core'
import { Meta, StoryFn } from '@storybook/react'
import React from 'react'

import { InstantFeedback as InstantFeedbackCompnent } from './InstantFeedback'

export default {
	title: 'Design System/Instant Feedback',
	component: InstantFeedbackCompnent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=70%3A2310&t=gF8uAWa4xEOPSNAI-0',
		},
	},
} as Meta<typeof InstantFeedbackCompnent>

export const InstantFeedback = {
	args: {
		displayTextKey: 'resource-saved',
		icon: 'heartFilled',
		link: {
			href: '#',
			textKey: 'view-list',
		},
	},
}
