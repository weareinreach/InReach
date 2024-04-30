import { type PatchRequest, type ResponseObject, type SourceStringsModel } from '@crowdin/crowdin-api-client'
import invariant from 'tiny-invariant'

import { branches, fileIds, projectId } from '../constants'

import type CrowdinApi from '@crowdin/crowdin-api-client'

const getProjectId = (isDatabaseString: boolean = false) =>
	isDatabaseString ? projectId.dbContent : projectId.base

export const createCommonFns = (client: CrowdinApi) => {
	const getStringIdByKey = async (key: string, isDatabaseString?: boolean) => {
		const { data: crowdinString } = await client.sourceStringsApi.listProjectStrings(
			getProjectId(isDatabaseString),
			{
				branchId: isDatabaseString ? branches.database : branches.main,
				filter: key,
				scope: 'identifier',
			}
		)

		return crowdinString.find(({ data }) => data.identifier === key)?.data.id
	}

	const updateSingleKey: UpdateSingleString = async ({ updatedString, isDatabaseString, ...params }) => {
		const stringId = params.crowdinId ?? (await getStringIdByKey(params.key, isDatabaseString))
		invariant(stringId)
		const { data: response } = await client.sourceStringsApi.editString(
			getProjectId(isDatabaseString),
			stringId,
			[{ op: 'replace', path: '/text', value: updatedString }]
		)
		return response
	}
	const updateMultipleKeys: UpdateMultipleStrings = async (updates) => {
		const baseRequest: PatchRequest[] = []
		const dbRequest: PatchRequest[] = []
		for (const { updatedString, isDatabaseString, ...params } of updates) {
			const stringId = params.crowdinId ?? (await getStringIdByKey(params.key, isDatabaseString))
			invariant(stringId)
			const requestArgs: PatchRequest = {
				op: 'replace',
				path: `${stringId}/text`,
				value: updatedString,
			}

			isDatabaseString ? dbRequest.push(requestArgs) : baseRequest.push(requestArgs)
		}
		const response: Array<ResponseObject<SourceStringsModel.String>> = []

		if (baseRequest.length) {
			const { data: baseResult } = await client.sourceStringsApi.stringBatchOperations(
				getProjectId(false),
				baseRequest
			)
			response.push(...baseResult)
		}
		if (dbRequest.length) {
			const { data: dbResult } = await client.sourceStringsApi.stringBatchOperations(
				getProjectId(true),
				dbRequest
			)
			response.push(...dbResult)
		}
		return response
	}
	const addSingleKey: AddSingleKey = async ({ isDatabaseString, key, text, ...params }) => {
		const branchId = isDatabaseString ? branches.database : undefined
		const fileId = isDatabaseString ? undefined : fileIds.main[params.ns ?? 'common']
		const identifier = key

		const requestArgs: typeof isDatabaseString extends true
			? SourceStringsModel.CreateStringStringsBasedRequest
			: SourceStringsModel.CreateStringRequest = {
			...(branchId && { branchId }),
			...(fileId && { fileId }),
			identifier,
			text,
		}
		console.log(getProjectId(isDatabaseString), requestArgs)

		const { data: response } = await client.sourceStringsApi.addString(
			getProjectId(isDatabaseString),
			requestArgs
		)

		console.log(response)
		return response
	}

	const addMultipleKeys: AddMultipleKeys = async (newStrings) => {
		const baseRequest: Array<PatchRequest> = []
		const dbRequest: Array<PatchRequest> = []

		for (const { isDatabaseString, key: identifier, ns, text } of newStrings) {
			const branchId = isDatabaseString ? branches.database : undefined
			const fileId = isDatabaseString ? undefined : fileIds.main[ns ?? 'common']
			const addArgs: PatchRequest = {
				op: 'add',
				path: '/-',
				value: {
					branchId,
					fileId,
					identifier,
					text,
				},
			}
			isDatabaseString ? dbRequest.push(addArgs) : baseRequest.push(addArgs)
		}
		const response: Array<ResponseObject<SourceStringsModel.String>> = []

		if (baseRequest.length) {
			const { data: baseResponse } = await client.sourceStringsApi.stringBatchOperations(
				getProjectId(false),
				baseRequest
			)
			response.push(...baseResponse)
		}
		if (dbRequest.length) {
			const { data: dbResponse } = await client.sourceStringsApi.stringBatchOperations(
				getProjectId(true),
				dbRequest
			)
			response.push(...dbResponse)
		}

		return response
	}

	const upsertSingleKey: UpsertSingleKey = async (params) => {
		const { isDatabaseString, key, text } = params
		const existingId = await getStringIdByKey(key, isDatabaseString)

		if (existingId) {
			return await updateSingleKey({ crowdinId: existingId, updatedString: text, isDatabaseString })
		}
		if (isDatabaseString) {
			return await addSingleKey(params)
		}
		return await addSingleKey(params)
	}

	return {
		getStringIdByKey,
		addMultipleKeys,
		addSingleKey,
		updateMultipleKeys,
		updateSingleKey,
		upsertSingleKey,
	}
}

interface UpdateStringById {
	isDatabaseString: boolean
	crowdinId: number
	updatedString: string
	key?: never
}
interface UpdateStringByKey {
	isDatabaseString: boolean
	crowdinId?: never
	updatedString: string
	key: string
}

interface UpdateSingleString {
	({ key, updatedString, isDatabaseString }: UpdateStringByKey): Promise<SourceStringsModel.String>
	({ crowdinId, updatedString }: UpdateStringById): Promise<SourceStringsModel.String>
}
interface UpdateMultipleStrings {
	(updates: Array<UpdateStringByKey>): Promise<Array<ResponseObject<SourceStringsModel.String>>>
	(updates: Array<UpdateStringById>): Promise<Array<ResponseObject<SourceStringsModel.String>>>
}

interface AddSingleKey {
	(params: AddDatabaseStringParams): Promise<SourceStringsModel.String>
	(params: AddFileStringParams): Promise<SourceStringsModel.String>
}
interface AddMultipleKeys {
	(params: Array<AddFileStringParams>): Promise<Array<ResponseObject<SourceStringsModel.String>>>
	(params: Array<AddDatabaseStringParams>): Promise<Array<ResponseObject<SourceStringsModel.String>>>
}

interface AddDatabaseStringParams {
	isDatabaseString: true
	ns?: never
	key: string
	text: string
}
interface AddFileStringParams {
	isDatabaseString: false
	ns: keyof (typeof fileIds)['main']
	key: string
	text: string
}

interface UpsertSingleKey {
	(params: UpsertDatabaseString): Promise<SourceStringsModel.String>
	(params: UpsertFileString): Promise<SourceStringsModel.String>
}

interface UpsertDatabaseString {
	isDatabaseString: true
	ns?: never
	text: string
	key: string
}
interface UpsertFileString {
	isDatabaseString: false
	ns: keyof (typeof fileIds)['main']
	text: string
	key: string
}
