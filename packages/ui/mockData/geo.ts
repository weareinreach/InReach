import { type ApiInput, type ApiOutput } from '@weareinreach/api'
import { getTRPCMock } from '~ui/lib/getTrpcMock'

const getFullAddress = async (
	placeId: ApiInput['geo']['geoByPlaceId']
): Promise<ApiOutput['geo']['geoByPlaceId']> => {
	const { default: data } = await import('./json/geo.getFullAddress.json')
	return (
		Object.keys(data).includes(placeId)
			? data[placeId as keyof typeof data]
			: data.ChIJKyDtC7i3t4kRkWca2kUeRuY
	) as ApiOutput['geo']['geoByPlaceId']
}

export const geo = {
	autocompleteFullAddress: getTRPCMock({
		path: ['geo', 'autocomplete'],
		type: 'query',
		response: async (): Promise<ApiOutput['geo']['autocomplete']> => {
			const { default: data } = await import('./json/geo.autocompleteFullAddress.json')
			return data as ApiOutput['geo']['autocomplete']
		},
	}),
	geocodeFullAddress: getTRPCMock({
		path: ['geo', 'geoByPlaceId'],
		type: 'query',
		response: getFullAddress,
	}),
	placeIdCityState: getTRPCMock({
		path: ['geo', 'geoByPlaceId'],
		response: async (): Promise<ApiOutput['geo']['geoByPlaceId']> => {
			const { default: data } = await import('./json/geo.placeIdCityState.json')
			return data as ApiOutput['geo']['geoByPlaceId']
		},
	}),
	autocompleteCityState: getTRPCMock({
		path: ['geo', 'autocomplete'],
		type: 'query',
		response: async () => {
			const { default: data } = await import('./json/geo.autocompleteCityState.json')
			return data as ApiOutput['geo']['autocomplete']
		},
	}),
	autocompleteSearchBox: getTRPCMock({
		path: ['geo', 'autocomplete'],
		type: 'query',
		response: async (input) => {
			const { default: data } = await import('./json/geo.autocompleteSearchBox.json')

			const searchRegex = new RegExp(`.*${input.search}.*`, 'i')
			const results = data
				.filter(({ searchValue }) => searchRegex.test(searchValue))
				.map(({ searchValue, ...data }) => ({ ...data }))

			if (!results.length) return { results, status: 'ZERO_RESULTS' }

			return { results, status: 'OK' }
		},
	}),
	geocodeSearchBox: getTRPCMock({
		path: ['geo', 'geoByPlaceId'],
		response: async (input) => {
			const { default: data } = await import('./json/geo.geocodeSearchBox.json')

			const results = data
				.filter(({ placeId }) => placeId === input)
				.map(({ geometry, ...data }) => ({ geometry, ...data }))
			const result = results[0] as ApiOutput['geo']['geoByPlaceId']['result']

			return { result, status: 'OK' }
		},
	}),
}
