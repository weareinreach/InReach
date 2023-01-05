import otaClient, { ClientConfig } from '@crowdin/ota-client'

const hash = 'e-39328dacf5f98928e8273b35wj'

const options: ClientConfig = {
	// disableJsonDeepMerge: true,
	disableLanguagesCache: true,
	// disableStringsCache: true,
	// disableManifestCache: true,
	enterpriseOrganizationDomain: 'inreach',
}
export const ota = new otaClient(hash, options)
