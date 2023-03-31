import { type ApiOutput } from '@weareinreach/api'

export const geoByPlaceIdCityState = {
	status: 'OK',
	result: {
		streetNumber: undefined,
		streetName: undefined,
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
} satisfies ApiOutput['geo']['geoByPlaceId']
export const geoAutocompleteCityState = {
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
} satisfies ApiOutput['geo']['autocomplete']
