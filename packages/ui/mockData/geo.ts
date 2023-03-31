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

export const getFullAddress = (placeId: string): ApiOutput['geo']['geoByPlaceId'] => {
	const data = {
		ChIJb3QAk3W3t4kRutCtFhHp3Ps: {
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
		},
		ChIJcYM1qya3t4kRc74WPRj7sYI: {
			result: {
				geometry: {
					location: {
						lat: 38.8615918,
						lng: -77.05074499999999,
					},
					viewport: {
						northeast: {
							lat: 38.8630417302915,
							lng: -77.04943286970848,
						},
						southwest: {
							lat: 38.8603437697085,
							lng: -77.0521308302915,
						},
					},
				},
				streetNumber: '1235',
				streetName: 'South Clark Street',
				city: 'Arlington',
				govDist: 'VA',
				postCode: '22202',
				country: 'US',
			},
			status: 'OK',
		},
		ChIJa_U96pS3t4kRDkcIEZ7AOAY: {
			result: {
				geometry: {
					location: {
						lat: 38.9041649,
						lng: -77.0293694,
					},
					bounds: {
						northeast: {
							lat: 38.9045259,
							lng: -77.0289873,
						},
						southwest: {
							lat: 38.9038505,
							lng: -77.02946349999999,
						},
					},
					viewport: {
						northeast: {
							lat: 38.9055371802915,
							lng: -77.02787641970849,
						},
						southwest: {
							lat: 38.9028392197085,
							lng: -77.0305743802915,
						},
					},
				},
				streetNumber: '1234',
				streetName: 'Massachusetts Avenue Northwest',
				city: 'Washington',
				govDist: 'DC',
				postCode: '20005',
				country: 'US',
			},
			status: 'OK',
		},
		ChIJf_V0Hwu4t4kRODyM6gzYgS0: {
			result: {
				geometry: {
					location: {
						lat: 38.918697,
						lng: -76.9888859,
					},
					bounds: {
						northeast: {
							lat: 38.919051,
							lng: -76.9885501,
						},
						southwest: {
							lat: 38.9184487,
							lng: -76.9891359,
						},
					},
					viewport: {
						northeast: {
							lat: 38.9200988302915,
							lng: -76.98755561970849,
						},
						southwest: {
							lat: 38.9174008697085,
							lng: -76.99025358029151,
						},
					},
				},
				streetNumber: '1235',
				streetName: 'W Street Northeast',
				city: 'Washington',
				govDist: 'DC',
				postCode: '20018',
				country: 'US',
			},
			status: 'OK',
		},
		ChIJKyDtC7i3t4kRkWca2kUeRuY: {
			result: {
				geometry: {
					location: {
						lat: 38.9068626,
						lng: -77.0437183,
					},
					bounds: {
						northeast: {
							lat: 38.9069787,
							lng: -77.0436337,
						},
						southwest: {
							lat: 38.9067718,
							lng: -77.0438921,
						},
					},
					viewport: {
						northeast: {
							lat: 38.9082242302915,
							lng: -77.04231956970848,
						},
						southwest: {
							lat: 38.9055262697085,
							lng: -77.0450175302915,
						},
					},
				},
				streetNumber: '1234',
				streetName: '19th Street Northwest',
				city: 'Washington',
				govDist: 'DC',
				postCode: '20036',
				country: 'US',
			},
			status: 'OK',
		},
	} as const
	return Object.keys(data).includes(placeId)
		? data[placeId as keyof typeof data]
		: data.ChIJKyDtC7i3t4kRkWca2kUeRuY
}
