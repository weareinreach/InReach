import { type Meta } from '@storybook/react'

import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { surveyOptions } from '~ui/mockData/surveyOptions'

import { AccountVerifyModal } from './AccountVerified'

export default {
	title: 'Modals/Account Verify',
	component: AccountVerifyModal,
	parameters: {
		msw: [
			getTRPCMock({
				path: ['user', 'confirmAccount'],
				type: 'mutation',
				response: { $metadata: {} },
				delay: 2000,
			}),
			getTRPCMock({
				path: ['user', 'surveyOptions'],
				type: 'query',
				response: { ...surveyOptions },
			}),
			getTRPCMock({
				path: ['user', 'submitSurvey'],
				type: 'mutation',
				response: 'not a real id',
			}),
		],
		nextjs: {
			router: {
				query: {
					c: 'eyJlbWFpbCI6InVzZXJAZW1haWwuY29tIiwiZGF0YWJhc2VJZCI6InVzZXJfTE9OR2lkU1RSSU5HZnJvbURCIn0',
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
} satisfies Meta<typeof AccountVerifyModal>

/**
 * Modal does not have a launch target - it will automatically launch based on the current URL.
 *
 * If the url contains the query string `?r=xxx`, where `xxx` is a base64 string, the modal will launch.
 */
export const Modal = {}
