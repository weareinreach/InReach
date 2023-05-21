import { Center } from '@mantine/core'
import { type Meta } from '@storybook/react'

import { Button } from '~ui/components/core/Button'
import { surveyOptions } from '~ui/mockData/surveyOptions'

import { UserSurveyModalLauncher } from '.'
import { getTRPCMock } from '../../lib/getTrpcMock'

export default {
	title: 'Modals/User Survey',
	component: UserSurveyModalLauncher,
	parameters: {
		layout: 'fullscreen',
		msw: [
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
	},
	args: {
		component: Button,
		children: 'Launch User Survey Modal',
	},
	render: (args) => (
		<Center h='50vh'>
			<UserSurveyModalLauncher {...args} />
		</Center>
	),
} satisfies Meta<typeof UserSurveyModalLauncher>

export const Modal = {}
