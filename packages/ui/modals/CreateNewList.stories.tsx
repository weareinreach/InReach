import { type Meta } from '@storybook/nextjs'

import { Button } from '~ui/components/core/Button'
import { getTRPCMock } from '~ui/lib/getTrpcMock'

import { CreateNewList } from './CreateNewList'

export default {
	title: 'Modals/Create New List',
	component: CreateNewList,

	beforeEach({ msw }) {
		msw.use(
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
			})
		)
	},

	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
	},

	args: {
		component: Button,
		children: 'Open Create New List Modal',
		variant: 'primary',
	},
} satisfies Meta<typeof CreateNewList>

export const Modal = {}
