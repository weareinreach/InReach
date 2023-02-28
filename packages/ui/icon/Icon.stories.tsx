import { Meta } from '@storybook/react'

import { Icon as IconComponent } from '.'

export default {
	title: 'Design System/Icon',
	component: IconComponent,
	argTypes: {
		height: {
			control: 'number',
		},
		color: {
			control: 'color',
		},
	},
	args: {
		height: 24,
		icon: 'carbon:favorite-filled',
	},
} satisfies Meta<typeof IconComponent>

export const Icon = {}
