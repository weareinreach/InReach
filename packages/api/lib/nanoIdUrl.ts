import { customAlphabet } from 'nanoid'

const alphaChoices = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

export const nanoUrl = customAlphabet(alphaChoices, 10)
