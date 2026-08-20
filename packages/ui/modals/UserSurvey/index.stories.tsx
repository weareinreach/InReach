import { Center } from '@mantine/core'
import { type Meta } from '@storybook/nextjs'

import { Button } from '~ui/components/core/Button'
import { user } from '~ui/mockData/user'

import { SurveyModalLauncher } from '.'
import { getTRPCMock } from '../../lib/getTrpcMock'

export default {
	title: 'Modals/User Survey',
	component: SurveyModalLauncher,

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
			<SurveyModalLauncher {...args} />
		</Center>
	),
} satisfies Meta<typeof SurveyModalLauncher>

export const Modal = {}
