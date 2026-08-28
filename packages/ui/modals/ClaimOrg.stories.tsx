import { type Meta } from '@storybook/nextjs'

import { Button } from '~ui/components/core/Button'

import { ClaimOrgModal } from './ClaimOrg'

export default {
	title: 'Modals/Claim Organization',
	component: ClaimOrgModal,
	parameters: { layout: 'fullscreen', layoutWrapper: 'centeredHalf' },
	args: {
		component: Button,
		children: 'Open Modal',
		variant: 'primary',
	},
} satisfies Meta<typeof ClaimOrgModal>

export const Modal = {}
