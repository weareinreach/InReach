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

const VerifiedBadgeVariant: ComponentStory<typeof VerifiedBadgeComp> = (args) => (
	<VerifiedBadgeComp {...args} />
)

export const VerifiedBadge = VerifiedBadgeVariant.bind({})

VerifiedBadge.args = {
	lastVerifiedDate: new Date(),
}
