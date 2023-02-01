import { Meta, StoryFn } from '@storybook/react'
import React from 'react'

import { Badge } from './Badge'

export default {
	title: 'Design System/Tags and Badges',
	component: Badge,
	parameters: {
		controls: {
			include: ['variant', 'children', 'leftSection'],
		},
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8361&t=WHlvdeWA5onN4z6O-0,',
		},
	},
} as Meta<typeof Badge>

export const CommunityTag = {
	args: {
		leftSection: '✊🏿',
		children: 'BIPOC community',
		variant: 'commmunityTag',
	},
}

export const ServiceTag = {
	args: {
		children: 'Abortion Care',
		variant: 'serviceTag',
	},
}
