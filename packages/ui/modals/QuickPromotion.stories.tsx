import { Center } from '@mantine/core'
import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { openQuickPromotionModal } from './QuickPromotion'

const ModalTemplate = () => {
	return (
		<Center maw='100vw' h='100vh'>
			<Button onClick={openQuickPromotionModal}>Open Modal</Button>
		</Center>
	)
}

export default {
	title: 'Modals/Quick Promotion',
	component: ModalTemplate,
	parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ModalTemplate>

export const Modal = {}
