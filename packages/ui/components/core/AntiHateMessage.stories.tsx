import { Center } from '@mantine/core'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { AntiHateMessage as AntiHateMessageCompnent } from './AntiHateMessage'

export default {
	title: 'Design System/Anti-Hate Message',
	component: AntiHateMessageCompnent,
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
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=70%3A2310&t=uf3ycT7Eq8Rtc9FZ-0',
		},
	},
} as ComponentMeta<typeof AntiHateMessageCompnent>

const AntiHateMessage: ComponentStory<typeof AntiHateMessageCompnent> = () => <AntiHateMessageCompnent />

export const AntiHateMessageCard = AntiHateMessage.bind({})
