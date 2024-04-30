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
	// eslint-disable-next-line no-var
	var crowdinApi: Crowdin | undefined
}
export const {
	addSingleKey,
	getStringIdByKey,
	updateMultipleKeys,
	updateSingleKey,
	addMultipleKeys,
	upsertSingleKey,
} = createCommonFns(crowdinApi)

export const addSingleKeyFromNestedFreetextCreate = async (
	freeText: AddStringFromNestedFreetextCreateParams
) => {
	if (freeText.create.tsKey?.create) {
		return await addSingleKey({
			isDatabaseString: true,
			key: freeText.create.tsKey.create.key,
			text: freeText.create.tsKey.create.text,
		})
	}
	throw new Error('Unable to add string to Crowdin, check args.')
}

export { branches, sourceFiles, projectId } from '../constants'

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
