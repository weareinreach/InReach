import { type Meta, type StoryObj } from '@storybook/react'

import { DonateModal } from './index'

export default {
	title: 'Components/Core/Donate',
	component: DonateModal,
	parameters: {
		layoutWrapper: 'centeredFullscreen',
	},
} satisfies Meta<typeof DonateModal>

type StoryDef = StoryObj<typeof DonateModal>
export const Default = {} satisfies StoryDef
