import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { AlertMessageModal } from './AlertMessageForm'

export default {
	title: 'Modals/Alert Message Form',
	component: AlertMessageModal,
	args: {
		orgName: 'The trevor project',
		component: Button,
		children: 'Open Modal',
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/449Snk9R17VyIlRWH4c42F/%5BWIP%5D-New-Data-Portal-Layout?node-id=104-8867&t=OHaBYWwOFHJbJly9-0',
		},
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
	},
} satisfies Meta<typeof AlertMessageModal>

export const Modal = {}
