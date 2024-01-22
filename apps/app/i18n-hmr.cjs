/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable node/no-process-env */
const isBrowser = typeof window !== 'undefined'
const isDev = process.env.NODE_ENV !== 'production' && !process.env.CI

const loadHMRplugin = () => {
	if (isDev) {
		const { HMRPlugin } = require('i18next-hmr/plugin')
		if (isBrowser) {
			return new HMRPlugin({ webpack: { client: true } })
		} else {
			return new HMRPlugin({ webpack: { server: true } })
		}
	}
	return undefined
}

module.exports = loadHMRplugin
