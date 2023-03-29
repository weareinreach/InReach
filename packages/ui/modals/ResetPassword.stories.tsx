import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { ResetPasswordModal } from './ResetPassword'
import { getTRPCMock } from '../lib/getTrpcMock'

export default {
	title: 'Modals/Reset Password',
	component: ResetPasswordModal,
	parameters: {
		msw: [
			getTRPCMock({
				path: ['user', 'resetPassword'],
				type: 'mutation',
				response: { $metadata: {} },
			}),
		],
		nextjs: {
			router: {
				query: {
					r: 'eyJlbWFpbCI6InVzZXJAZW1haWwuY29tIiwiZGF0YWJhc2VJZCI6InVzZXJfTE9OR2lkU1RSSU5HZnJvbURCIn0',
					code: '123456',
				},
			},
		},
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
	},
	args: {
		// component: Button,
		// children: 'Open Reset Password Modal',
		// variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof ResetPasswordModal>

/**
 * Modal does not have a launch target - it will automatically launch based on the current URL.
 *
 * If the url contains the query string `?r=xxx`, where `xxx` is a base64 string, the modal will launch.
 */
export const Modal = {}
