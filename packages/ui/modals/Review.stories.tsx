import { type Meta } from '@storybook/nextjs'

import { Button } from '~ui/components/core/Button'
import { getTRPCMock } from '~ui/lib/getTrpcMock'

import { ReviewModal } from './Review'

export default {
	title: 'Modals/Review',
	component: ReviewModal,

	beforeEach({ msw }) {
		msw.use(
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
			})
		)
	},

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
	},

	args: {
		component: Button,
		children: 'Open Review Modal',
		variant: 'primary',
	},
} satisfies Meta<typeof ReviewModal>

export const Modal = {
	parameters: {
		nextAuthMock: {
			session: 'userPic',
		},
	},
}
