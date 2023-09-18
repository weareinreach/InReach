/* eslint-disable node/no-process-env */
/* eslint-disable no-var */
import Crowdin from '@crowdin/crowdin-api-client'

import { createCommonFns } from 'common/apiFns'

export const crowdinEdge =
	global.crowdinEdge ||
	new Crowdin(
		{
			organization: 'inreach',
			token: process.env.CROWDIN_TOKEN as string,
		},
		{ httpClientType: 'fetch' }
	)
if (process.env.NODE_ENV !== 'production') {
	global.crowdinEdge = crowdinEdge
}
declare global {
	var crowdinEdge: Crowdin | undefined
}
export const { getStringIdByKey } = createCommonFns(crowdinEdge)
export { branches, sourceFiles, projectId } from '../constants'
