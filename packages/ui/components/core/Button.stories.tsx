import { Meta, StoryFn } from '@storybook/react'
import React from 'react'

import { Button } from './Button'
import { Icon } from '../../icon'

export default {
	title: 'Design System/Button',
	component: Button,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=196%3A5045&t=0SZ0JVMYe5r7bNkb-4',
		},
		controls: {
			include: ['variant'],
		},
	},
	argTypes: {
		variant: {
			options: ['sm-primary', 'sm-secondary', 'sm-accent', 'lg-primary', 'lg-secondary', 'lg-accent'],
			control: 'select',
		},
		children: {
			control: 'string',
		},
	},
} as Meta<typeof Button>

export const SmallPrimary = {
	args: {
		variant: 'sm-primary',
		children: 'Download the app',
	},
}

export const SmallSecondary = {
	args: {
		variant: 'sm-secondary',
		children: 'InReach.org',
	},
}

export const SmallAccent = {
	args: {
		variant: 'sm-accent',
		children: 'Safety exit',
	},
}

export const LargePrimary = {
	args: {
		variant: 'lg-primary',
		children: 'More sorting options',
		leftIcon: <Icon icon='carbon:settings-adjust' rotate={3} />,
	},
}

export const LargeSecondary = {
	args: {
		variant: 'lg-secondary',
		children: 'Save',
		leftIcon: <Icon icon='carbon:favorite' />,
	},
}

export const LargeAccent = {
	args: {
		variant: 'lg-accent',
		children: 'View map',
		leftIcon: <Icon icon='carbon:map' />,
	},
}
