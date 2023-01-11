import otaClient from '@crowdin/ota-client'
import { BackendModule, InitOptions, MultiReadCallback, ReadCallback, Services } from 'i18next'

export class CrowdinOta implements BackendModule<BackendOptions> {
	type: 'backend'
	otaClient: otaClient
	init(services: Services, backendOptions: BackendOptions, i18nextOptions: InitOptions<object>): void {
		if (!backendOptions.hash) throw new Error('Missing Crowdin hash value')
	}
	constructor(
		hash: string,
		services: Services,
		backendOptions: BackendOptions,
		i18nextOptions: InitOptions<object>
	) {
		this.type = 'backend'
		this.otaClient = new otaClient(hash)
		this.init(services, backendOptions, i18nextOptions)
	}

	read(language: string, namespace: string, callback: ReadCallback) {
		this.otaClient
			.getStringsByLocale(undefined, language)
			.then((value) => callback(null, value))
			.catch((e) => callback(e, null))
	}
	readMulti(languages: readonly string[], namespaces: readonly string[], callback: MultiReadCallback): void {
		return
	}
}
type BackendOptions = {
	hash: string
}
