import { Center } from '@mantine/core'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { VerifiedBadge as VerifiedBadgeComp } from './VerifiedBadge'

export default {
	title: 'Core/Verified Badge',
	component: VerifiedBadgeComp,
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
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8361&t=zaarlIghpneWF6Qn-0',
		},
	},
} as ComponentMeta<typeof VerifiedBadgeComp>

const VerifiedBadgeVariant: ComponentStory<typeof VerifiedBadgeComp> = (args) => <VerifiedBadgeComp {...args} />

export const VerifiedTag = VerifiedBadgeVariant.bind({})

VerifiedTag.args = {
	text:"Verified information",
	tooltip_text: "The information on this page was last updated Tue, Oct 25, 2022. InReach prioritizes accuracy and user safety, and updates all information at least once every 6 months. For more information on our vetting process, please visit our Verification Process page.",
}
