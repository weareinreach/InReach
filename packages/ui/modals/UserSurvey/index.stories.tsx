import { Center } from '@mantine/core'
import { type Meta } from '@storybook/nextjs'

import { Button } from '~ui/components/core/Button'
import { user } from '~ui/mockData/user'

import { UserSurveyModalLauncher } from '.'
import { getTRPCMock } from '../../lib/getTrpcMock'

export default {
	title: 'Modals/User Survey',
	component: UserSurveyModalLauncher,

	beforeEach({ msw }) {
		msw.use(
			user.surveyOptions,
			getTRPCMock({
				path: ['user', 'submitSurvey'],
				type: 'mutation',
				response: 'not a real id',
			})
		)
	},

	parameters: {
		layout: 'fullscreen',
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
