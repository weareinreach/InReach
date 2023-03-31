import { Center } from '@mantine/core'
import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { UserSurveyModalLauncher } from '.'
import { getTRPCMock } from '../../lib/getTrpcMock'

export default {
	title: 'Modals/User Survey',
	component: UserSurveyModalLauncher,
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
		children: 'Launch UserSurvey Modal',
	},
	render: (args) => (
		<Center h='50vh'>
			<UserSurveyModalLauncher {...args} />
		</Center>
	),
} satisfies Meta<typeof UserSurveyModalLauncher>

export const Modal = {}
