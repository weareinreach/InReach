import { type PatchRequest } from '@crowdin/crowdin-api-client'

import { branches, fileIds, projectId } from '../constants'

import type CrowdinApi from '@crowdin/crowdin-api-client'

export const createCommonFns = (client: CrowdinApi) => ({
	getStringIdByKey: async (key: string, databaseString?: boolean) => {
		const { data: crowdinString } = await client.sourceStringsApi.listProjectStrings(projectId, {
			branchId: databaseString ? branches.database : branches.main,
			filter: key,
			scope: 'identifier',
		})

		return crowdinString.find(({ data }) => data.identifier === key)?.data.id
	},
	updateSingleKey: async ({ crowdinId, updatedString }: UpdateStringParams) => {
		const { data: response } = await client.sourceStringsApi.editString(projectId, crowdinId, [
			{ op: 'replace', path: '/text', value: updatedString },
		])
		return response
	},
	updateMultipleKeys: async (updates: UpdateStringParams[]) => {
		const { data: response } = await client.sourceStringsApi.stringBatchOperations(
			projectId,
			updates.map(({ crowdinId, updatedString }) => ({
				op: 'replace',
				path: `${crowdinId}/text`,
				value: updatedString,
			}))
		)
		return response
	},
	addSingleKey: async ({ databaseString = true, key, ns, text }: AddStringParams) => {
		const branchId = databaseString ? branches.database : branches.main
		const fileId = databaseString ? fileIds.database['org-data'] : fileIds.main[ns ?? 'common']
		const identifier = key
		const { data: response } = await client.sourceStringsApi.addString(projectId, {
			branchId,
			fileId,
			identifier,
			text,
		})
		return response
	},
	addMultipleKeys: async (newStrings: AddStringParams[]) => {
		const request: PatchRequest[] = newStrings.map(({ databaseString = true, key, ns, text }) => {
			const branchId = databaseString ? branches.database : branches.main
			const fileId = databaseString ? fileIds.database['org-data'] : fileIds.main[ns ?? 'common']
			const identifier = key
			return {
				op: 'add',
				path: '/-',
				value: {
					branchId,
					fileId,
					identifier,
					text,
				},
			}
		})

		const { data: response } = await client.sourceStringsApi.stringBatchOperations(projectId, request)
		return response
	},
})

interface UpdateStringParams {
	crowdinId: number
	updatedString: string
}
type AddStringParams = AddDatabaseStringParams | AddFileStringParams
interface AddDatabaseStringParams {
	databaseString: true
	ns?: never
	key: string
	text: string
}
interface AddFileStringParams {
	databaseString: false
	ns: keyof (typeof fileIds)['main']
	key: string
	text: string
}
