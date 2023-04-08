import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { getAll } from '~ui/mockData/savedList'
import { mockServData } from '~ui/mockData/serviceModal'

import { ServiceModal } from './Service'

const serviceId = 'svce_KLSDJFKLSJDF'

export default {
	title: 'Modals/Service Info',
	component: ServiceModal,
	parameters: {
		msw: [
			getTRPCMock({
				path: ['service', 'byId'],
				type: 'query',
				response: mockServData(),
			}),
			getTRPCMock({
				path: ['service', 'getParentName'],
				response: { name: 'Organization name' },
			}),
			getTRPCMock({
				path: ['savedList', 'getAll'],
				response: getAll,
			}),
			getTRPCMock({
				path: ['organization', 'getIdFromSlug'],
				type: 'query',
				response: {
					id: 'orgn_ORGANIZATIONID',
				},
			}),
		],
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
