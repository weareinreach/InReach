import { ApiOutput } from '@weareinreach/api'

export const getAll = [
	{
		_count: { organizations: 0, services: 0, sharedWith: 0 },
		id: 'ulst_LISTID1',
		name: 'Example List 1',
	},
	{
		_count: { organizations: 0, services: 0, sharedWith: 0 },
		id: 'ulst_LISTID2',
		name: 'Example List 2',
	},
	{
		_count: { organizations: 0, services: 0, sharedWith: 0 },
		id: 'ulst_LISTID3',
		name: 'Example List 3',
	},
] satisfies ApiOutput['savedList']['getAll']

export const saveItem = {
	id: 'ulst_LISTID',
	organizations: ['orgn_ITEM1', 'orgn_ITEM2'],
	services: [],
} satisfies ApiOutput['savedList']['saveItem']

export const createAndSave = {
	id: 'ulst_NEWLISTID',
	organizations: ['orgn_ITEM1'],
	services: [],
} satisfies ApiOutput['savedList']['createAndSaveItem']
