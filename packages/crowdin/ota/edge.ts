/* eslint-disable no-var */
/* eslint-disable node/no-process-env */

import OtaClient from '@crowdin/ota-client'

import { createCommonFns } from '../common/otaFns'
import { otaHash } from '../constants'

export const crowdinEdgeOta =
	global.crowdinEdgeOta ||
	new OtaClient(otaHash, {
		enterpriseOrganizationDomain: 'inreach',
		disableJsonDeepMerge: true,
		httpClient: {
			get: async <T>(url: string) => {
				const data = await fetch(url)
				return (await data.json()) as T
			},
		},
	})
if (process.env.NODE_ENV !== 'production') {
	global.crowdinEdgeOta = crowdinEdgeOta
}
declare global {
	var crowdinEdgeOta: OtaClient | undefined
}

const { crowdinDistTimestamp, fetchCrowdinDbKey, fetchCrowdinFile } = createCommonFns(crowdinEdgeOta)

export { sourceFiles } from '../constants'
export { crowdinDistTimestamp, fetchCrowdinDbKey, fetchCrowdinFile }
