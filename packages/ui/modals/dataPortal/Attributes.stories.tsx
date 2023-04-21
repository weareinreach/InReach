import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { queryAttributeCategories, queryAttributesByCategory } from '~ui/mockData/fieldOpt'

import { AttributeModal } from './Attributes'

export default {
	title: 'Data Portal/Modals/Attributes',
	component: AttributeModal,
	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
		msw: [
			getTRPCMock({
				path: ['fieldOpt', 'attributeCategories'],
				response: (input) => queryAttributeCategories(input),
			}),
			getTRPCMock({
				path: ['fieldOpt', 'attributesByCategory'],
				response: (input) => queryAttributesByCategory(input),
			}),
		],
	},
	args: {
		component: Button,
		children: 'Open Modal',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof AttributeModal>

export const Modal = {}
