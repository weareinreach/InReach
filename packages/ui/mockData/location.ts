import { type ApiOutput } from '@weareinreach/api'
import { getTRPCMock } from '~ui/lib/getTrpcMock'

const getAddress = {
	id: 'oloc_01GVH3VEVBERFNA9PHHJYEBGA3',
	data: {
		name: 'Whitman-Walker 1525',
		street1: '1525 14th St. NW ',
		street2: '',
		city: 'Washington',
		postCode: '20005',
		govDistId: 'gdst_01GW2HJ5A278S2G84AB3N9FCW0',
		countryId: 'ctry_01GW2HHDK9M26M80SG63T21SVH',
		latitude: 38.91,
		longitude: -77.032,
		mailOnly: null,
		published: true,
		accessible: {
			supplementId: undefined,
			boolean: undefined,
		},
		services: [
			'osvc_01GVH3VEVSNF9NH79R7HC9FHY6',
			'osvc_01GVH3VEW2ND36DB0XWAH1PQY0',
			'osvc_01GVH3VEW3CZ8P9VS6A5MA0R7Z',
			'osvc_01GVH3VEWHDC6F5FCQHB0H5GD6',
			'osvc_01GVH3VEWK33YAKZMQ2W3GT4QK',
		],
	},
} satisfies ApiOutput['location']['getAddress']
const forLocationCard = {
	id: 'oloc_01GVH3VEVBERFNA9PHHJYEBGA3',
	name: 'Whitman-Walker 1525',
	street1: '1525 14th St. NW ',
	street2: '',
	city: 'Washington',
	postCode: '20005',
	country: 'US',
	govDist: {
		abbrev: 'DC',
		tsKey: 'us-district-of-columbia',
		tsNs: 'gov-dist',
	},
	phones: [],
	attributes: [],
	services: ['medical.CATEGORYNAME', 'mental-health.CATEGORYNAME'],
} satisfies ApiOutput['location']['forLocationCard']

export const location = {
	getAddress: getTRPCMock({
		path: ['location', 'getAddress'],
		response: getAddress,
	}),
	forLocationCard: getTRPCMock({
		path: ['location', 'forLocationCard'],
		response: forLocationCard,
	}),
}
