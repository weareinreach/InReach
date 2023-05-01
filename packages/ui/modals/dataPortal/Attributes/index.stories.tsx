import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { allFieldOptHandlers } from '~ui/mockData/fieldOpt'

import { AttributeModal } from './index'

export default {
	title: 'Data Portal/Modals/Attributes',
	component: AttributeModal,
	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
		msw: [...allFieldOptHandlers],
		rqDevtools: true,
	},
	args: {
		component: Button,
		children: 'Open Modal',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof AttributeModal>

export const Modal = {}
