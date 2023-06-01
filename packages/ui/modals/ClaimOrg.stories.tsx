import { type Meta } from '@storybook/react'

import { Button } from '~ui/components/core/Button'

import { ClaimOrgModal } from './ClaimOrg'

export default {
	title: 'Modals/Claim Organization',
	component: ClaimOrgModal,
	parameters: { layout: 'fullscreen', layoutWrapper: 'centeredHalf' },
	args: {
		component: Button,
		children: 'Open Modal',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof ClaimOrgModal>

export const Modal = {}
