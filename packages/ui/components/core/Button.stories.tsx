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
	},
	argTypes: {
		variant: {
			control: false,
		},
		children: {
			control: 'text',
		},
		disabled: {
			control: false,
		},
		leftIcon: {
			control: false,
		},
	},
} satisfies Meta<typeof Button>

type StoryDef = StoryObj<typeof Button>

const disabled = (Story: StoryObj) => ({
	args: {
		...Story.args,
		disabled: true,
	},
})

export const Primary = {
	args: {
		variant: 'primary',
		children: 'Download the app',
	},
} satisfies StoryDef
export const PrimaryDisabled = disabled(Primary)
export const PrimaryWithIcon = {
	args: {
		variant: 'primary-icon',
		children: 'More filters',
		leftIcon: <Icon icon='carbon:settings-adjust' rotate={2} />,
	},
} satisfies StoryDef
export const PrimaryWithIconDisabled = disabled(PrimaryWithIcon)

export const Secondary = {
	args: {
		variant: 'secondary',
		children: 'InReach.org',
	},
} satisfies StoryDef
export const SecondaryDisabled = disabled(Secondary)
export const SecondaryWithIcon = {
	args: {
		variant: 'secondary-icon',
		children: 'Save',
		leftIcon: <Icon icon='carbon:favorite' />,
	},
} satisfies StoryDef
export const SecondaryWithIconDisabled = disabled(SecondaryWithIcon)
export const Accent = {
	args: {
		variant: 'accent',
		children: 'Safety exit',
	},
} satisfies StoryDef
export const AccentDisabled = disabled(Accent)
export const AccentWithIcon = {
	args: {
		variant: 'accent-icon',
		children: 'View map',
		leftIcon: <Icon icon='carbon:map' />,
	},
} satisfies StoryDef
export const AccentWithIconDisabled = disabled(AccentWithIcon)
