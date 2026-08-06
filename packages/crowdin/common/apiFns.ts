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

	const updateSingleKey: UpdateSingleString = async (args) => {
		const { updatedString, isDatabaseString, context, ...params } = args
		const stringId = params.crowdinId ?? (await getStringIdByKey(params.key, isDatabaseString))
		invariant(stringId)
		const patchOps: PatchRequest[] = [{ op: 'replace', path: '/text', value: updatedString }]
		if (context) {
			patchOps.push({ op: 'replace', path: '/context', value: context })
		}
		const { data: response } = await client.sourceStringsApi.editString(
			getProjectId(isDatabaseString),
			stringId,
			patchOps
		)
		return response
	}
	const updateMultipleKeys: UpdateMultipleStrings = async (updates) => {
		const baseRequest: PatchRequest[] = []
		const dbRequest: PatchRequest[] = []
		for (const { updatedString, isDatabaseString, context, ...params } of updates) {
			const stringId = params.crowdinId ?? (await getStringIdByKey(params.key, isDatabaseString))
			invariant(stringId)
			const requestArgs: PatchRequest = {
				op: 'replace',
				path: `${stringId}/text`,
				value: updatedString,
			}

			isDatabaseString ? dbRequest.push(requestArgs) : baseRequest.push(requestArgs)

			if (context) {
				const contextArgs: PatchRequest = {
					op: 'replace',
					path: `${stringId}/context`,
					value: context,
				}
				isDatabaseString ? dbRequest.push(contextArgs) : baseRequest.push(contextArgs)
			}
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
	const addSingleKey: AddSingleKey = async (args) => {
		const { isDatabaseString, key, text, context, ...params } = args
		const identifier = key

		const requestArgs:
			| SourceStringsModel.CreateStringStringsBasedRequest
			| SourceStringsModel.CreateStringRequest = isDatabaseString
			? ({
					branchId: branches.database,
					identifier,
					text,
					context,
				} satisfies SourceStringsModel.CreateStringStringsBasedRequest)
			: ({
					fileId: fileIds.main[params.ns ?? 'common'],
					identifier,
					text,
					context,
				} satisfies SourceStringsModel.CreateStringRequest)

		const { data: response } = await client.sourceStringsApi.addString(
			getProjectId(isDatabaseString),
			requestArgs
		)
		return response
	}

	const addMultipleKeys: AddMultipleKeys = async (newStrings) => {
		const baseRequest: Array<PatchRequest> = []
		const dbRequest: Array<PatchRequest> = []

		for (const { isDatabaseString, key: identifier, ns, text, context } of newStrings) {
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
					context,
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
		const { isDatabaseString, key, text, context } = params
		const existingId = await getStringIdByKey(key, isDatabaseString)

		if (existingId) {
			return await updateSingleKey({ crowdinId: existingId, updatedString: text, isDatabaseString, context })
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
	/** A link back to the live app (e.g. https://app.inreach.org/org/<slug>) shown in Crowdin's context panel. */
	context?: string
}
interface UpdateStringByKey {
	isDatabaseString: boolean
	crowdinId?: never
	updatedString: string
	key: string
	/** A link back to the live app (e.g. https://app.inreach.org/org/<slug>) shown in Crowdin's context panel. */
	context?: string
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
	/** A link back to the live app (e.g. https://app.inreach.org/org/<slug>) shown in Crowdin's context panel. */
	context?: string
}
interface AddFileStringParams {
	isDatabaseString: false
	ns: keyof (typeof fileIds)['main']
	key: string
	text: string
	/** A link back to the live app (e.g. https://app.inreach.org/org/<slug>) shown in Crowdin's context panel. */
	context?: string
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
	/** A link back to the live app (e.g. https://app.inreach.org/org/<slug>) shown in Crowdin's context panel. */
	context?: string
}
interface UpsertFileString {
	isDatabaseString: false
	ns: keyof (typeof fileIds)['main']
	text: string
	key: string
	/** A link back to the live app (e.g. https://app.inreach.org/org/<slug>) shown in Crowdin's context panel. */
	context?: string
}
