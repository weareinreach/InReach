import { type Meta, type StoryObj } from '@storybook/nextjs'

import { Button } from '~ui/components/core/Button'
import { allFieldOptHandlers } from '~ui/mockData/fieldOpt'
import { organization } from '~ui/mockData/organization'

import { AttributeModal } from './index'

type StoryDef = StoryObj<typeof AttributeModal>
export default {
	title: 'Data Portal/Modals/Attributes',
	component: AttributeModal,

	beforeEach({ msw }) {
		msw.use(...allFieldOptHandlers, organization.attachAttribute)
	},

	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
		rqDevtools: true,
	},

	args: {
		component: Button,
		children: 'Open Modal',
		variant: 'primary',
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
