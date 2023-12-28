import { Center } from '@mantine/core'
import { type Meta } from '@storybook/react'

import { Button } from '~ui/components/core/Button'
import { user } from '~ui/mockData/user'

import { UserSurveyModalLauncher } from '.'
import { getTRPCMock } from '../../lib/getTrpcMock'

export default {
	title: 'Modals/User Survey',
	component: UserSurveyModalLauncher,
	parameters: {
		layout: 'fullscreen',
		msw: [
			user.surveyOptions,
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
