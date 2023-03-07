import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'
import { getTRPCMock } from '~ui/lib/getTrpcMock'

import { openReviewModal } from './Review'
// import { UserReviewSubmit } from '../components/core/UserReviewSubmit'

const ModalTemplate = () => {
	return <Button onClick={openReviewModal}>Open Modal</Button>
}

export default {
	title: 'Modals/Review',
	component: ModalTemplate,
	parameters: {
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
} satisfies Meta<typeof ModalTemplate>

export const Modal = {
	parameters: {
		nextAuthMock: {
			session: 'noAuth',
		},
	},
}
