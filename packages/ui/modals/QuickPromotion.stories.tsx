import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { QuickPromotionModal } from './QuickPromotion'

export default {
	title: 'Modals/Quick Promotion',
	component: QuickPromotionModal,
	parameters: { layout: 'fullscreen', layoutWrapper: 'centeredHalf' },
	args: {
		component: Button,
		children: 'Open Quick Promotion Modal',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof QuickPromotionModal>

export const Modal = {}
