import { Center } from '@mantine/core'
import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'
import { geoAutocompleteCityState, geoByPlaceIdCityState } from '~ui/mockData/geo'

import { SignupModalLauncher } from '.'
import { getTRPCMock } from '../../lib/getTrpcMock'

export default {
	title: 'Modals/Sign Up',
	component: SignupModalLauncher,
	parameters: {
		layout: 'fullscreen',
		msw: [
			getTRPCMock({
				path: ['geo', 'autocomplete'],
				type: 'query',
				response: geoAutocompleteCityState,
			}),
			getTRPCMock({
				path: ['geo', 'geoByPlaceId'],
				response: geoByPlaceIdCityState,
			}),
			getTRPCMock({
				path: ['user', 'create'],
				type: 'mutation',
				response: {
					success: true,
				},
			}),
		],
	},
	args: {
		component: Button,
		children: 'Launch Signup Modal',
	},
	render: (args) => (
		<Center h='50vh'>
			<SignupModalLauncher {...args} />
		</Center>
	),
} satisfies Meta<typeof SignupModalLauncher>

export const Modal = {}
