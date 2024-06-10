import { type ApiOutput } from '@weareinreach/api'
import { getTRPCMock, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const location = {
	getAddress: getTRPCMock({
		path: ['location', 'getAddress'],
		response: async () => {
			const { default: data } = await import('./json/location.getAddress.json')
			return data as ApiOutput['location']['getAddress']
		},
	}),
	forLocationCard: getTRPCMock({
		path: ['location', 'forLocationCard'],
		response: async () => {
			const { default: data } = await import('./json/location.forLocationCard.json')
			return data as ApiOutput['location']['forLocationCard']
		},
	}),
	forVisitCard: getTRPCMock({
		path: ['location', 'forVisitCard'],
		response: async () => {
			const { default: data } = await import('./json/location.forVisitCard.json')
			return data as ApiOutput['location']['forVisitCard']
		},
	}),
	forGoogleMaps: getTRPCMock({
		path: ['location', 'forGoogleMaps'],
		response: async () => {
			const { default: data } = await import('./json/location.forGoogleMaps.json')
			return data as ApiOutput['location']['forGoogleMaps']
		},
	}),
	getNames: getTRPCMock({
		path: ['location', 'getNames'],
		response: async () => {
			const { default: data } = await import('./json/location.getNames.json')
			return data
		},
	}),
	create: getTRPCMock({
		path: ['location', 'create'],
		type: 'mutation',
		response: ({ address, ...rest }) => ({
			apiLocationId: null,
			checkMigration: null,
			...rest,
			...address,
			countryId: address?.countryId ?? '',
			govDistId: address?.govDistId ?? '',
			street1: address?.street1 ?? '',
			street2: address?.street2 ?? null,
			city: address?.city ?? '',
			postCode: address?.postCode ?? null,
			notVisitable: rest.notVisitable ?? false,
			latitude: address?.latitude ?? null,
			longitude: address?.longitude ?? null,
			id: 'oloc_000NEWID',
			createdAt: new Date(),
			updatedAt: new Date(),
			deleted: false,
			published: false,
			mailOnly: false,
			legacyId: null,
			descriptionId: null,
			mapCityOnly: false,
			geoJSON: null,
			geoWKT: null,
			primary: false,
		}),
	}),
} satisfies MockHandlerObject<'location'>
