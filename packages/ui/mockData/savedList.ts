import { type HttpHandler } from 'msw'

import { getTRPCMock, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const savedList = {
	getAll: getTRPCMock({
		path: ['savedList', 'getAll'],
		response: async () => {
			const { default: data } = await import('./json/savedList.getAll.json')
			return data.map((record) => ({ ...record, updatedAt: new Date() }))
		},
	}),
	saveItem: getTRPCMock({
		path: ['savedList', 'saveItem'],
		type: 'mutation',
		response: {
			id: 'ulst_LISTID',
			organizations: ['orgn_ITEM1', 'orgn_ITEM2'],
			services: [],
		},
	}),
	createAndSaveItem: getTRPCMock({
		path: ['savedList', 'createAndSaveItem'],
		type: 'mutation',
		response: {
			id: 'ulst_NEWLISTID',
			organizations: ['orgn_ITEM1'],
			services: [],
		},
	}),
	isSavedSingle: getTRPCMock({
		path: ['savedList', 'isSaved'],
		response: [
			{
				id: 'listId',
				name: 'List Name',
			},
		],
	}),
	isSavedMultiple: getTRPCMock({
		path: ['savedList', 'isSaved'],
		response: [
			{
				id: 'listId1',
				name: 'List Name 1',
			},
			{
				id: 'listId2',
				name: 'List Name 2',
			},
		],
	}),
	deleteItem: getTRPCMock({
		path: ['savedList', 'deleteItem'],
		type: 'mutation',
		response: {
			id: 'listId',
			name: 'list name',
			organizations: [],
			services: [],
		},
	}),
} satisfies MockHandlerObject<'savedList'> & { isSavedMultiple: HttpHandler; isSavedSingle: HttpHandler }
