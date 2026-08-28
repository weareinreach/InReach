import { type Meta } from '@storybook/nextjs'

import { Button } from '~ui/components/core/Button'

import { RecommendedLinksModal } from './RecommendedLinks'

export default {
	title: 'Modals/Recommended Links',
	component: RecommendedLinksModal,
	parameters: { layout: 'fullscreen', layoutWrapper: 'centeredHalf' },
	args: {
		component: Button,
		children: 'Open Recommended Links Modal',
		variant: 'primary',
	},
} satisfies Meta<typeof RecommendedLinksModal>

export const Modal = {}
