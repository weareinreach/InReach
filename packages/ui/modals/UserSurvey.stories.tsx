import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { surveyOptions } from '~ui/mockData/surveyOptions'

import { UserSurveyModalLauncher } from './UserSurvey'

export default {
	title: 'Modals/User Survey',
	component: UserSurveyModalLauncher,
	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/Csxx8VRhrEgCilKJ5R8hb6/Accounts-Redesign?node-id=139-8437&t=8NIiOdNz9xIC6J0d-0',
		},
		msw: [
			getTRPCMock({
				path: ['user', 'surveyOptions'],
				response: surveyOptions,
			}),
			getTRPCMock({
				path: ['user', 'submitSurvey'],
				response: 'usvy_IDofNEWsubmittedSURVEY',
			}),
		],
	},
	args: {
		component: Button,
		children: 'Open User Survey Modal',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof UserSurveyModalLauncher>

export const Modal = {}
