import { type Meta } from '@storybook/react'

import { Button } from '~ui/components/core/Button'

import { RecommendedLinksModal } from './RecommendedLinks'

export default {
	title: 'Modals/Recommended Links',
	component: RecommendedLinksModal,
	parameters: { layout: 'fullscreen', layoutWrapper: 'centeredHalf' },
	args: {
		component: Button,
		children: 'Open Recommended Links Modal',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof RecommendedLinksModal>

export const Modal = {}
