import { Meta, StoryFn } from '@storybook/react'
import React from 'react'

import { Badge } from './Badge'

export default {
	title: 'Design System/Tags and Badges',
	component: Badge,
	parameters: {
		docs: {
			description: {
				component: 'These are examples of Tags and Badges',
			},
		},
		controls: {
			include: ['variant', 'children', 'leftSection'],
		},
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8361&t=WHlvdeWA5onN4z6O-0,',
		},
	},
} as Meta<typeof Badge>

export const CommunityTagLarge = {
	args: {
		leftSection: '✊🏿',
		children: 'BIPOC community',
		variant: 'commmunityTag-large',
	},
}

export const CommunityTagSmall = {
	args: {
		leftSection: '✊🏿',
		children: 'BIPOC community',
		variant: 'commmunityTag-small',
	},
}

export const ServiceTagLarge = {
	args: {
		children: 'Abortion Care',
		variant: 'serviceTag-large',
	},
}

export const ServiceTagSmall = {
	args: {
		children: 'Abortion Care',
		variant: 'serviceTag-small',
	},
}
