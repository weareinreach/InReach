import { type Meta } from '@storybook/nextjs'

import { Button } from '~ui/components/core/Button'

import { QuickPromotionModal } from './QuickPromotion'

export default {
	title: 'Modals/Quick Promotion',
	component: QuickPromotionModal,
	parameters: { layout: 'fullscreen', layoutWrapper: 'centeredHalf' },
	args: {
		component: Button,
		children: 'Open Quick Promotion Modal',
		variant: 'primary',
	},
} satisfies Meta<typeof QuickPromotionModal>

export const Modal = {}
