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
	const gh = new Octokit({ auth: process.env.GH_DATASTORE_PAT })
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
}
