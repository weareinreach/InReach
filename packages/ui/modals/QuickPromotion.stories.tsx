import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'
import { csrf, providers, signin, cognito } from '~ui/mockData/login'

import { openQuickPromotionModal } from './QuickPromotion'

/** Define the modal to display here. */
// const modalToDisplay = LoginModal()

const ModalTemplate = () => {
	return <Button onClick={openQuickPromotionModal}>Open Modal</Button>
}

export default {
	title: 'Modals/Quick Promotion',
	component: ModalTemplate,
	parameters: {
		msw: [signin(), csrf(), providers(), cognito()],
	},
} satisfies Meta<typeof ModalTemplate>

export const Modal = {}
