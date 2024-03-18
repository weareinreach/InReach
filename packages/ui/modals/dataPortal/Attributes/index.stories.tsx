import { type Meta, type StoryObj } from '@storybook/react'

import { Button } from '~ui/components/core/Button'
import { allFieldOptHandlers } from '~ui/mockData/fieldOpt'
import { organization } from '~ui/mockData/organization'

import { AttributeModal } from './index'

type StoryDef = StoryObj<typeof AttributeModal>
export default {
	title: 'Data Portal/Modals/Attributes',
	component: AttributeModal,
	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
		msw: [...allFieldOptHandlers, organization.attachAttribute],
		rqDevtools: true,
	},
	args: {
		component: Button,
		children: 'Open Modal',
		variant: 'inlineInvertedUtil1',
		restrictCategories: undefined,
		attachesTo: undefined,
	},
} satisfies Meta<typeof AttributeModal>

export const AllCategories = {} satisfies StoryDef
export const AttachesToService = {
	args: {
		attachesTo: ['SERVICE'],
		parentRecord: { serviceId: 'osvc_123456' },
	},
} satisfies StoryDef
