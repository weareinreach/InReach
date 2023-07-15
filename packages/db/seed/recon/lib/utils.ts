import superjson from 'superjson'
import { type SuperJSONResult } from 'superjson/dist/types'

import fs from 'fs'
import path from 'path'

export const readSuperJSON = <T = unknown>(filename: string) => {
	const data = fs.readFileSync(path.resolve(__dirname, `../generated/${filename}.json`), 'utf-8')
	return superjson.parse<T>(data)
}
export const isSuperJSON = (obj: unknown): obj is SuperJSONResult =>
	typeof obj === 'object' && obj !== null && Object.hasOwn(obj, 'json')

export const trimSpaces = (str: string) => str.trim().replaceAll(/ +(?=[^\S\n])/g, ' ')

export const emptyStrToNull = (str: string | null | undefined) =>
	str === '' || str === null ? null : str === undefined ? undefined : trimSpaces(str)

/**
 * Throws an error - Use to raise an error for nullish-coalesced values
 *
 * @example FnThatDoesntAcceptUndefined(possibleUndefined ?? raise('this is the error'))
 */
export const raise = (err: string): never => {
	throw new Error(err)
}

export const conditionalObj = <T extends Record<string, unknown>>(
	condition: unknown,
	obj: T
): T | Record<string, never> => (condition ? obj : {})
