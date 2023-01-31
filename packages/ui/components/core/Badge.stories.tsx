import { Meta, StoryFn } from '@storybook/react'
import React from 'react'

import { Badge } from './Badge'

export default {
	title: 'Design System/Tags and Badges',
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
			control: 'string',
		},
	},
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
