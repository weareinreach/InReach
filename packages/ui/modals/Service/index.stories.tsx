import { type Meta } from '@storybook/react'

import { Button } from '~ui/components/core/Button'
import { organization } from '~ui/mockData/organization'
import { savedList } from '~ui/mockData/savedList'
import { service } from '~ui/mockData/service'

import { ServiceModal } from './index'

const serviceId = 'svce_KLSDJFKLSJDF'

export default {
	title: 'Modals/Service Info',
	component: ServiceModal,
	parameters: {
		msw: [service.getParentName, savedList.getAll, organization.getIdFromSlug, service.forServiceModal],
		nextjs: {
			router: {
				pathname: '/org/[slug]',
				asPath: '/org/mockOrg',
				query: {
					slug: 'mockOrg',
				},
			},
		},
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=215%3A10190&t=ImTreJvyGV7TGV1z-4',
		},
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
	},
	args: {
		component: Button,
		children: 'Open Modal',
		serviceId,
	},
} satisfies Meta<typeof ServiceModal>

export const Modal = {}
