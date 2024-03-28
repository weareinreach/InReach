import invariant from 'tiny-invariant'

import { getTRPCMock, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const component = {
	ServiceSelect: getTRPCMock({
		path: ['component', 'ServiceSelect'],
		response: async () => {
			const { default: data } = await import('./json/component.ServiceSelect.json')
			return data
		},
	}),
	LocationBasedAlertBanner: getTRPCMock({
		path: ['component', 'LocationBasedAlertBanner'],
		response: async ({ lat, lon }) => {
			const { default: data } = await import('./json/component.LocationBasedAlertBanner.json')
			if (!lat && !lon) {
				return data
			}
			switch (lat || lon) {
				case 1: {
					const item = data.at(0)
					invariant(item, 'expected to find an item')
					return [item]
				}
				case 2: {
					const item = data.at(1)
					invariant(item, 'expected to find an item')
					return [item]
				}
				case 3: {
					const item = data.at(2)
					invariant(item, 'expected to find an item')
					return [item]
				}
				default: {
					return data
				}
			}
		},
	}),
} satisfies MockHandlerObject<'component'>
