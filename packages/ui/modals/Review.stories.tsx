import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { openReviewModal } from './Review'

const ModalTemplate = () => {
	return <Button onClick={openReviewModal}>Open Modal</Button>
}

export default {
	title: 'Modals/Review',
	component: ModalTemplate,
} satisfies Meta<typeof ModalTemplate>

export const Modal = {}
