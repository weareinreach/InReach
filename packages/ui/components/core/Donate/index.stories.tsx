import { type Meta, type StoryObj } from '@storybook/react'

import { Donate } from './index'

export default {
	title: 'Components/Core/Donate',
	component: Donate,
	parameters: {
		layoutWrapper: 'centeredFullscreen',
	},
} satisfies Meta<typeof Donate>

type StoryDef = StoryObj<typeof Donate>
export const Default = {} satisfies StoryDef
