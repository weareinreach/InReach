import { type Meta, type StoryObj } from '@storybook/react'

import { Button } from '~ui/components/core/Button'
import { getTRPCMock } from '~ui/lib/getTrpcMock'

import { ReportModal } from './Report'

export default {
	title: 'Modals/Report',
	component: ReportModal,
	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
		nextjs: {
			router: {
				pathname: '/org/[slug]',
				asPath: '/org/mockOrg',
				query: {
					slug: 'mockOrg',
				},
			},
		},
		msw: {
			handlers: [
				getTRPCMock({
					path: ['organization', 'getIdFromSlug'],
					type: 'query',
					response: {
						id: 'orgn_ORGANIZATIONID',
					},
				}),
				getTRPCMock({
					path: ['review', 'create'],
					type: 'mutation',
					response: {
						id: 'orev_NEWREVIEWID',
					},
				}),
			],
		},
	},
	args: {
		component: Button,
		children: 'Open Report Modal',
		variant: 'inlineInvertedUtil1',
		itemId: 'orgn_MOCKORGID', // Example ID
		itemName: 'Mock Organization', // Example Name
	},
} satisfies Meta<typeof ReportModal>

type Story = StoryObj<typeof ReportModal>

export const Organization: Story = {
	parameters: {
		nextAuthMock: {
			session: 'userPic',
		},
	},
	args: {
		itemId: 'orgn_MOCKORGID',
		itemName: 'Mock Organization',
	},
}

export const Service: Story = {
	parameters: {
		nextAuthMock: {
			session: 'userPic',
		},
		nextjs: {
			router: {
				pathname: '/org/[slug]/service/[serviceId]',
				asPath: '/org/mockOrg/service/mockService',
				query: {
					slug: 'mockOrg',
					serviceId: 'mockService',
				},
			},
		},
	},
	args: {
		itemId: 'serv_MOCKSERVICEID',
		itemName: 'Mock Service',
	},
}
