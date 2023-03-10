import { Center } from '@mantine/core'
import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { SignupModalLauncher } from '.'
import { getTRPCMock } from '../../lib/getTrpcMock'

/** Define the modal to display here. */
// const modalToDisplay = LoginModal()

// const ModalTemplate = () => {
// 	return (
// 		<Center maw='100vw' h='100vh'>
// 			<Button onClick={openLoginModal}>Open Modal</Button>
// 		</Center>
// 	)
// }

export default {
	title: 'Modals/Sign Up',
	component: SignupModalLauncher,
	parameters: {
		layout: 'fullscreen',
		msw: [
			getTRPCMock({
				path: ['geo', 'autocomplete'],
				type: 'query',
				response: {
					results: [
						{
							value: 'New York',
							subheading: 'NY, USA',
							placeId: 'ChIJOwg_06VPwokRYv534QaPC8g',
						},
						{
							value: 'Washington D.C.',
							subheading: 'DC, USA',
							placeId: 'ChIJW-T2Wt7Gt4kRKl2I1CJFUsI',
						},
						{
							value: 'Boston',
							subheading: 'MA, USA',
							placeId: 'ChIJGzE9DS1l44kRoOhiASS_fHg',
						},
						{
							value: 'Atlanta',
							subheading: 'GA, USA',
							placeId: 'ChIJjQmTaV0E9YgRC2MLmS_e_mY',
						},
					],
					status: 'OK',
				},
			}),
			getTRPCMock({
				path: ['geo', 'geoByPlaceId'],
				response: {
					status: 'OK',
					result: {
						city: 'New York',
						country: 'US',
						govDist: 'NY',
						geometry: {
							location: { lat: 0, lng: 0 },
							viewport: {
								northeast: {
									lat: 0,
									lng: 0,
								},
								southwest: { lat: 0, lng: 0 },
							},
						},
					},
				},
			}),
		],
	},
	args: {
		component: Button,
		children: 'Launch Modal',
	},
	render: (args) => (
		<Center h='50vh'>
			<SignupModalLauncher {...args} />
		</Center>
	),
} satisfies Meta<typeof SignupModalLauncher>

export const Modal = {}
