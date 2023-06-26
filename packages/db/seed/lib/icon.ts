/**
 * `🐕 fetch`
 *
 * `🏗️ create`
 *
 * `🤷 skip`
 *
 * `🛠️ generate`
 *
 * `🗣️ tlate`
 *
 * `🔑 access`
 *
 * `🔗 link`
 *
 * `⚙️ gear`
 *
 * `⚠️ warning`
 *
 * `✍️ write`
 *
 * `🚮 trash`
 *
 * `🔵 info`
 *
 * `😵 error`
 */
export type Log = (message: string, icon?: IconList, indent?: boolean, silent?: boolean) => void

export type IconList =
	| 'fetch'
	| 'generate'
	| 'tlate'
	| 'create'
	| 'skip'
	| 'access'
	| 'link'
	| 'gear'
	| 'write'
	| 'warning'
	| 'trash'
	| 'info'
	| 'error'

export const iconList = (icon: IconList) => {
	switch (icon) {
		case 'fetch':
			return '🐕'
		case 'create':
			return '🏗️'
		case 'skip':
			return '🤷'
		case 'generate':
			return '🛠️'
		case 'tlate':
			return '🗣️'
		case 'access':
			return '🔑'
		case 'link':
			return '🔗'
		case 'gear':
			return '⚙️'
		case 'warning':
			return '⚠️'
		case 'write':
			return '✍️'
		case 'trash':
			return '🚮'
		case 'info':
			return '🔵'
		case 'error':
			return '😵'
	}
}
