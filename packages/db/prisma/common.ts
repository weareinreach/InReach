export const isSuccess = (criteria: unknown) => (criteria ? '✅' : '❎')

/**
 * Throws an error - Use to raise an error for nullish-coalesced values
 *
 * @example FnThatDoesntAcceptUndefined(possibleUndefined ?? raise('this is the error'))
 */
export const raise = (err: string): never => {
	throw new Error(err)
}
