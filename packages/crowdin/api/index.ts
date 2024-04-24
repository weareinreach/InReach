/* eslint-disable node/no-process-env */
/* eslint-disable no-var */
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
export const { addSingleKey, getStringIdByKey, updateMultipleKeys, updateSingleKey } =
	createCommonFns(crowdinApi)
export { branches, sourceFiles, projectId } from '../constants'
