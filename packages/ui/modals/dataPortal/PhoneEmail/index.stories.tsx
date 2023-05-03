import { type Meta } from '@storybook/react'

import { Button } from '~ui/components/core'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { allFieldOptHandlers } from '~ui/mockData/fieldOpt'

import { PhoneEmailModal } from './index'

export default {
	title: 'Data Portal/Modals/Add Phone or Email',
	component: PhoneEmailModal,
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
} satisfies Meta<typeof PhoneEmailModal>

export const Modal = {}
