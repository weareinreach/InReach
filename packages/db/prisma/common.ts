import { Octokit } from '@octokit/core'
import prettyBytes from 'pretty-bytes'
import sizeOf from 'string-byte-length'

import { iconList, type IconList } from '~db/lib/icons'

export const isSuccess = (criteria: unknown) => (criteria ? '✅' : '❎')
export const formatMessage = (message: string, icon?: IconList, indent = false) => {
	const dispIcon = icon ? `${iconList(icon)} ` : ''
	const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
	return formattedMessage
}
type FormatMessage = (message: string, icon?: IconList, indent?: boolean) => string
/**
 * Throws an error - Use to raise an error for nullish-coalesced values
 *
 * @example FnThatDoesntAcceptUndefined(possibleUndefined ?? raise('this is the error'))
 */
export const raise = (err: string): never => {
	throw new Error(err)
}

export const downloadFromDatastore = async (path: string, logger?: FormatMessage): Promise<unknown> => {
	// eslint-disable-next-line node/no-process-env
	const githubPAT = process.env.GH_DATASTORE_PAT
	if (!githubPAT) {
		throw new Error(
			`Missing 'GH_DATASTORE_PAT' environment variable.\nIf you need to generate a new one, visit https://github.com/settings/tokens\nThe token must be CLASSIC and not the newer 'fine-grained' variety. When selecting the scopes, the minimum required is 'repo'`
		)
	}
	const gh = new Octokit({ auth: githubPAT })
	const log = logger || console.log
	const datafileInfo = await gh.request('GET /repos/{owner}/{repo}/contents/{path}', {
		owner: 'weareinreach',
		repo: 'datastore',
		path,
	})
	if (datafileInfo.data && !Array.isArray(datafileInfo.data) && datafileInfo.data.download_url) {
		const download = await fetch(datafileInfo.data.download_url)
		const data = await download.json()
		const size = sizeOf(JSON.stringify(data))
		log(`Downloaded '${datafileInfo.data.path}' (${prettyBytes(size)})`)
		return data
	}
	throw new Error('Unable to download from datastore')
}
