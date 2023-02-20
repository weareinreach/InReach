import { Meta, StoryObj } from '@storybook/react'

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
} satisfies Meta<typeof Button>

type StoryDef = StoryObj<typeof Button>

export const Primary = {
	args: {
		variant: 'primary',
		children: 'Download the app',
	},
} satisfies StoryDef
export const PrimaryWithIcon = {
	args: {
		variant: 'primary-icon',
		children: 'More sorting options',
		leftIcon: <Icon icon='carbon:settings-adjust' rotate={3} />,
	},
} satisfies StoryDef

export const Secondary = {
	args: {
		variant: 'secondary',
		children: 'InReach.org',
	},
}
export const SecondaryWithIcon = {
	args: {
		variant: 'secondary-icon',
		children: 'Save',
		leftIcon: <Icon icon='carbon:favorite' />,
	},
}

export const Accent = {
	args: {
		variant: 'accent',
		children: 'Safety exit',
	},
}
export const AccentWithIcon = {
	args: {
		variant: 'accent-icon',
		children: 'View map',
		leftIcon: <Icon icon='carbon:map' />,
	},
}
