import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { openQuickPromotionModal } from './QuickPromotion'

const ModalTemplate = () => {
	return <Button onClick={openQuickPromotionModal}>Open Modal</Button>
}

export default {
	title: 'Modals/Quick Promotion',
	component: ModalTemplate,
} satisfies Meta<typeof ModalTemplate>

export const Modal = {}
