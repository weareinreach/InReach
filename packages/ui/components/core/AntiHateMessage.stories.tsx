import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { AntiHateMessage as AntiHateMessageCompnent } from './AntiHateMessage'

export default {
	title: 'Design System/Anti-Hate Message',
	component: AntiHateMessageCompnent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=368%3A6934&t=OPIs2wdc5n2td3Nf-4',
		},
	},
} as ComponentMeta<typeof AntiHateMessageCompnent>

const AntiHateMessage: ComponentStory<typeof AntiHateMessageCompnent> = () => <AntiHateMessageCompnent />

export const AntiHateMessageCard = AntiHateMessage.bind({})
