/* eslint-disable no-var */
/* eslint-disable node/no-process-env */

import OtaClient from '@crowdin/ota-client'

import { createCommonFns } from '../common/otaFns'
import { otaHash } from '../constants'

export const crowdinOta =
	global.crowdinOta ||
	new OtaClient(otaHash, {
		enterpriseOrganizationDomain: 'inreach',
		disableJsonDeepMerge: true,
		...(fetch instanceof Function
			? {
					httpClient: {
						get: async <T>(url: string) => {
							const data = await fetch(url)
							return (await data.json()) as T
						},
					},
				}
			: {}),
	})
if (process.env.NODE_ENV !== 'production') {
	global.crowdinOta = crowdinOta
}
declare global {
	var crowdinOta: OtaClient | undefined
}
const { crowdinDistTimestamp, fetchCrowdinDbKey, fetchCrowdinFile } = createCommonFns(crowdinOta)

export { sourceFiles } from '../constants'
export { crowdinDistTimestamp, fetchCrowdinDbKey, fetchCrowdinFile }
