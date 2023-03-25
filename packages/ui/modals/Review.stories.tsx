import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'
import { getTRPCMock } from '~ui/lib/getTrpcMock'

import { ReviewModal } from './Review'

export default {
	title: 'Modals/Review',
	component: ReviewModal,
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
		children: 'Open Review Modal',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof ReviewModal>

export const Modal = {
	parameters: {
		nextAuthMock: {
			session: 'userPic',
		},
	},
}
