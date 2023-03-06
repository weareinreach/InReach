import { Center } from '@mantine/core'
import { action } from '@storybook/addon-actions'
import { Meta, StoryObj } from '@storybook/react'

import { Toolbar } from './Toolbar'

export default {
	title: 'Design System/Toolbar',
	component: Toolbar,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=309%3A5895',
		},
		layout: 'fullscreen',
	},
	args: {
		breadcrumbProps: {
			option: 'back',
			backTo: 'search',
			onClick: () => action('onClick')(''),
		},
	},
	render: (args) => (
		<Center style={{ maxWidth: '861px', width: '100%', height: '100vh', margin: '0 auto' }}>
			<Toolbar {...args} />
		</Center>
	),
} satisfies Meta<typeof Toolbar>

type StoryDef = StoryObj<typeof Toolbar>

export const NotSaved = {
	args: { saved: false },
} satisfies StoryDef

export const Saved = {
	args: { saved: true },
} satisfies StoryDef

export const SmallVersion = {
	parameters: {
		viewport: {
			defaultViewport: 'iphone6',
		},
	},
}
