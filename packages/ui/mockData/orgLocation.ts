import { type ApiOutput } from '@weareinreach/api'
import { getTRPCMock } from '~ui/lib/getTrpcMock'

export const getNames = [
	{
		id: 'oloc_01GVH3VEVBERFNA9PHHJYEBGA3',
		name: 'Whitman-Walker 1525',
	},
	{
		id: 'oloc_01GVH3VEVBRCFA2AHNTWCXQA2B',
		name: 'Max Robinson Center',
	},
	{
		id: 'oloc_01GVH3VEVBSA85T6VR2C38BJPT',
		name: 'Whitman-Walker (LIZ)',
	},
] satisfies ApiOutput['location']['getNames']

export const location = {
	getNames: getTRPCMock({
		path: ['location', 'getNames'],
		response: getNames,
	}),
}
