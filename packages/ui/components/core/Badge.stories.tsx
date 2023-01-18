import { Badge } from '@mantine/core'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

export default {
	title: 'core/Tags and Badges',
	component: Badge,
	argTypes: {
		children: {
			description: 'This is the label to use for the Tag/Badge',
			table: {
				type: {
					summary: 'React Text',
					detail: 'Pass in a react text component here as a prop.',
				},
			},
		},
		variant: {
			description: 'This determines the style for the Tag/Badge',
			table: {
				type: {
					summary: 'Variant options',
					detail: 'commmunityTag-large, commmunityTag-small, serviceTag-large, serviceTag-small',
				},
			},
		},
		leftSection: {
			description: 'This determines the emoji/badge/icon that is to be displayed to the left of the text',
			table: {
				type: {
					summary: 'these are string values',
					detail: 'Tag - ✊🏿 OR Badge - 🤎, determined by the "children" value',
				},
			},
		},
	},
	parameters: {
		docs: {
			description: {
				component: 'These are examples of Tags and Badges',
			},
		},
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8361&t=WHlvdeWA5onN4z6O-0,',
		},
	},
} as ComponentMeta<typeof Badge>

const BadgeVariant: ComponentStory<typeof Badge> = (args) => <Badge {...args} />

export const Default = BadgeVariant.bind({})
export const CommunityTagLarge = BadgeVariant.bind({})
export const CommunityTagSmall = BadgeVariant.bind({})
export const ServiceTagLarge = BadgeVariant.bind({})
export const ServiceTagSmall = BadgeVariant.bind({})

Default.args = {
	children: 'default',
}

CommunityTagLarge.args = {
	leftSection: '✊🏿',
	children: 'BIPOC community',
	variant: 'commmunityTag-large',
}

CommunityTagSmall.args = {
	leftSection: '✊🏿',
	children: 'BIPOC community',
	variant: 'commmunityTag-small',
}

ServiceTagLarge.args = {
	children: 'Abortion Care',
	variant: 'serviceTag-large',
}

ServiceTagSmall.args = {
	children: 'Abortion Care',
	variant: 'serviceTag-small',
}
