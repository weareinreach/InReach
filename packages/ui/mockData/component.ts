import * as PrismaEnums from '@weareinreach/db/enums'
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
		response: async () => {
			const { default: data } = await import('./json/component.LocationBasedAlertBanner.json')

			const reformattedData = data.map(({ level, ...rest }) => {
				switch (level) {
					case 'INFO_PRIMARY': {
						return { ...rest, level: PrismaEnums.LocationAlertLevel.INFO_PRIMARY }
					}
					case 'WARN_PRIMARY': {
						return { ...rest, level: PrismaEnums.LocationAlertLevel.WARN_PRIMARY }
					}
					case 'CRITICAL_PRIMARY': {
						return { ...rest, level: PrismaEnums.LocationAlertLevel.CRITICAL_PRIMARY }
					}
					case 'INFO_SECONDARY': {
						return { ...rest, level: PrismaEnums.LocationAlertLevel.INFO_SECONDARY }
					}
					case 'WARN_SECONDARY': {
						return { ...rest, level: PrismaEnums.LocationAlertLevel.WARN_SECONDARY }
					}
					case 'CRITICAL_SECONDARY': {
						return { ...rest, level: PrismaEnums.LocationAlertLevel.CRITICAL_SECONDARY }
					}
					default: {
						throw new Error('Invalid alert level')
					}
				}
			})
			return reformattedData
		},
	}),
} satisfies MockHandlerObject<'component'>
