import { type ApiOutput } from '@weareinreach/api'

export const geoByPlaceIdCityState = {
	status: 'OK',
	result: {
		streetNumber: undefined,
		streetName: undefined,
		city: 'New York',
		country: 'US',
		govDist: 'NY',
		postCode: undefined,
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

export const geoAutocompleteFullAddress = {
	status: 'OK',
	results: [
		{
			value: '1235 South Clark Street',
			subheading: 'Arlington, VA, USA',
			placeId: 'ChIJcYM1qya3t4kRc74WPRj7sYI',
		},
		{
			value: '1238 Maryland Avenue Southwest',
			subheading: 'Washington, DC, USA',
			placeId: 'ChIJb3QAk3W3t4kRutCtFhHp3Ps',
		},
		{
			value: '1234 Massachusetts Avenue Northwest',
			subheading: 'Washington, DC, USA',
			placeId: 'ChIJa_U96pS3t4kRDkcIEZ7AOAY',
		},
		{
			value: '1235 W Street Northeast',
			subheading: 'Washington, DC, USA',
			placeId: 'ChIJf_V0Hwu4t4kRODyM6gzYgS0',
		},
		{
			value: '1234 19th Street Northwest',
			subheading: 'Washington, DC, USA',
			placeId: 'ChIJKyDtC7i3t4kRkWca2kUeRuY',
		},
	],
} satisfies ApiOutput['geo']['autocomplete']

export const geocodeFullAddress = {
	result: {
		geometry: {
			location: {
				lat: 38.8840413,
				lng: -77.0291325,
			},
			viewport: {
				northeast: {
					lat: 38.8854635302915,
					lng: -77.0278169197085,
				},
				southwest: {
					lat: 38.8827655697085,
					lng: -77.0305148802915,
				},
			},
		},
		streetNumber: '1238',
		streetName: 'Maryland Avenue Southwest',
		city: 'Washington',
		govDist: 'DC',
		postCode: '20024',
		country: 'US',
	},
	status: 'OK',
} satisfies ApiOutput['geo']['geoByPlaceId']
