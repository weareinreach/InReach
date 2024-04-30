/* eslint-disable node/no-process-env */

import OtaClient from '@crowdin/ota-client'
import { type ClientConfig } from '@crowdin/ota-client/out/model'

import { createCommonFns } from '../common/otaFns'
import { otaCommonHash, otaDbHash } from '../constants'

const clientConfig: ClientConfig = {
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
}

export const crowdinOta = global.crowdinOta || {
	common: new OtaClient(otaCommonHash, clientConfig),
	database: new OtaClient(otaDbHash, clientConfig),
}
if (process.env.NODE_ENV !== 'production') {
	global.crowdinOta = crowdinOta
}
declare global {
	// eslint-disable-next-line no-var
	var crowdinOta: { common: OtaClient; database: OtaClient } | undefined
}
const { crowdinDistTimestamp, fetchCrowdinDbKey, fetchCrowdinFile } = createCommonFns(crowdinOta)

export { sourceFiles } from '../constants'
export { crowdinDistTimestamp, fetchCrowdinDbKey, fetchCrowdinFile }
