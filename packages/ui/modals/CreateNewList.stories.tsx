import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'
import { getTRPCMock } from '~ui/lib/getTrpcMock'

import { CreateNewList } from './CreateNewList'

export default {
	title: 'Modals/Create New List',
	component: CreateNewList,
	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
		msw: [
			getTRPCMock({
				path: ['savedList', 'create'],
				type: 'mutation',
				response: {
					name: 'new list',
					id: 'NEWlistID',
				},
			}),
			getTRPCMock({
				path: ['savedList', 'createAndSaveItem'],
				type: 'mutation',
				response: {
					name: 'new list',
					id: 'NEWlistID',
					organizations: [],
					services: [],
				},
			}),
		],
	},
	args: {
		component: Button,
		children: 'Open Create New List Modal',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof CreateNewList>

export const Modal = {}
