import { type Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { BadgeEditModal } from '.'

export default {
	title: 'Data Portal/Modals/Badge Edit',
	component: BadgeEditModal,
	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
		msw: [],
		rqDevtools: true,
		whyDidYouRender: { collapseGroups: true },
	},
	args: {
		component: Button,
		children: 'Open Modal',
		orgId: 'orgn_123456',
	},
} satisfies Meta<typeof BadgeEditModal>

export const Modal = {}
