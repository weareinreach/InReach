import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { DeleteModal } from './DeleteModal'

export default {
	title: 'Modals/Delete Account',
	component: DeleteModal,
	parameters: { layout: 'fullscreen', layoutWrapper: 'centeredHalf' },
	args: {
		component: Button,
		children: 'Open Delete Account Modal',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof DeleteModal>

export const Modal = {}
