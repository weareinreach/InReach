import { Center } from '@mantine/core'
import { type Meta, type StoryObj } from '@storybook/react'

import { Button } from '~ui/components/core/Button'
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

type StoryDef = StoryObj<typeof SignupModalLauncher>
export const Modal = {} satisfies StoryDef

export const ExistingUser = {
	parameters: {
		msw: [
			getTRPCMock({
				path: ['user', 'create'],
				type: 'mutation',
				error: {
					code: 'CONFLICT',
					message: 'User already exists',
				},
			}),
			getTRPCMock({
				path: ['user', 'forgotPassword'],
				type: 'mutation',
				response: {
					CodeDeliveryDetails: {
						DeliveryMedium: 'EMAIL',
					},
					$metadata: {},
				},
			}),
		],
	},
} satisfies StoryDef
