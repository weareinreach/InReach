import { customAlphabet } from 'nanoid'

const alphaChoices = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

export const slugSize = 10

export const nanoUrl = customAlphabet(alphaChoices, slugSize)
