import { iconList, type IconList } from '~db/seed/lib'

export const isSuccess = (criteria: unknown) => (criteria ? '✅' : '❎')
export const formatMessage = (message: string, icon?: IconList, indent = false) => {
	const dispIcon = icon ? `${iconList(icon)} ` : ''
	const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
	return formattedMessage
}

/**
 * Throws an error - Use to raise an error for nullish-coalesced values
 *
 * @example FnThatDoesntAcceptUndefined(possibleUndefined ?? raise('this is the error'))
 */
export const raise = (err: string): never => {
	throw new Error(err)
}
