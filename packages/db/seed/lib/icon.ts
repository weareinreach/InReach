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
 *
 * `🧑‍💻 update`
 *
 * `💥 unlink`
 */
export type Log = (message: string, icon?: IconList, indent?: boolean, silent?: boolean) => void

export type IconList = keyof typeof iconObj
const iconObj = {
	fetch: '🐕',
	create: '🏗️',
	skip: '🤷',
	generate: '🛠️',
	tlate: '🗣️',
	access: '🔑',
	link: '🔗',
	gear: '⚙️',
	warning: '⚠️',
	write: '✍️',
	trash: '🚮',
	info: '🔵',
	error: '😵',
	update: '🧑‍💻',
	unlink: '💥',
} as const
export const iconList = (icon: IconList) => iconObj[icon]
