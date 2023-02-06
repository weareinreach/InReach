import { Meta, StoryFn } from '@storybook/react'
import React from 'react'

import { AntiHateMessage as AntiHateMessageCompnent } from './AntiHateMessage'
import { StorybookGrid } from '../layout/BodyGrid'

export default {
	title: 'Design System/Anti-Hate Message',
	component: AntiHateMessageCompnent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=368%3A6905&t=sleVeGl2lJv7Df18-4',
		},
	},
	layout: 'fullscreen',
	decorators: [StorybookGrid],
} as Meta<typeof AntiHateMessageCompnent>

export const AntiHateMessageCard = {
	render: () => <AntiHateMessageCompnent />,
}
