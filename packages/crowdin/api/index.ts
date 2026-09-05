/* eslint-disable node/no-process-env */
import Crowdin from '@crowdin/crowdin-api-client'

import { createCommonFns } from '../common/apiFns'

export const crowdinApi =
	global.crowdinApi ||
	new Crowdin(
		{
			organization: 'inreach',
			token: process.env.CROWDIN_TOKEN as string,
		},
		{ httpClientType: fetch instanceof Function ? 'fetch' : 'axios' }
	)
if (process.env.NODE_ENV !== 'production') {
	global.crowdinApi = crowdinApi
}
declare global {
	var crowdinApi: Crowdin | undefined
}
export const {
	addSingleKey,
	getStringIdByKey,
	updateMultipleKeys,
	updateSingleKey,
	addMultipleKeys,
	upsertSingleKey,
	removeSingleKey,
} = createCommonFns(crowdinApi)

export const addSingleKeyFromNestedFreetextCreate = async (
	freeText: AddStringFromNestedFreetextCreateParams,
	context?: string
) => {
	if (freeText.create.tsKey?.create) {
		return await addSingleKey({
			isDatabaseString: true,
			key: freeText.create.tsKey.create.key,
			text: freeText.create.tsKey.create.text,
			context,
		})
	}
	throw new Error('Unable to add string to Crowdin, check args.')
}

/**
 * Syncs a database-backed translation string to Crowdin, but only when there's actually something to send: if
 * the previously-saved text matches what's being saved now, this skips the network round trip entirely. When
 * a crowdinId is already known, this also skips the lookup-by-key call that `upsertSingleKey` would otherwise
 * make, going straight to the patch. Returns the crowdinId to persist on the record (unchanged, patched, or
 * newly-added).
 */
export const syncDatabaseStringIfChanged = async (params: {
	key: string
	newText: string
	previousText?: string | null
	previousCrowdinId?: number | null
	context?: string
}): Promise<number | undefined> => {
	const { key, newText, previousText, previousCrowdinId, context } = params
	if (previousCrowdinId && previousText === newText) {
		return previousCrowdinId
	}
	if (previousCrowdinId) {
		await updateSingleKey({
			crowdinId: previousCrowdinId,
			updatedString: newText,
			isDatabaseString: true,
			context,
		})
		return previousCrowdinId
	}
	const { id } = await upsertSingleKey({ isDatabaseString: true, key, text: newText, context })
	return id
}

export { branches, sourceFiles, projectId } from '../constants'
export { buildContextUrl } from '../common/buildContextUrl'

interface AddStringFromNestedFreetextCreateParams {
	create: {
		id: string
		tsKey?: {
			create?: {
				key: string
				text: string
				namespace: {
					connect: {
						name: string
					}
				}
			}
		}
	}
}
