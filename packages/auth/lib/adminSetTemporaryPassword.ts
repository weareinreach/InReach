import { randomInt } from 'crypto'

import { getEnv } from '@weareinreach/env'

import { cognito } from './cognitoClient'

// Avoids visually ambiguous characters (0/O, 1/l/I) since staff read this back to a user over the phone or
// a chat window rather than it ever being copy-pasted by the user themselves.
const UPPER = 'ABCDEFGHJKMNPQRSTUVWXYZ'
const LOWER = 'abcdefghjkmnpqrstuvwxyz'
const DIGITS = '23456789'
const SYMBOLS = '!@#%^&*'
const ALL = UPPER + LOWER + DIGITS + SYMBOLS

const pick = (chars: string) => chars[randomInt(chars.length)] as string

const shuffle = (chars: string[]) => {
	for (let i = chars.length - 1; i > 0; i--) {
		const j = randomInt(i + 1)
		;[chars[i], chars[j]] = [chars[j] as string, chars[i] as string]
	}
	return chars
}

/** Satisfies Cognito's default password policy (min length 8, all four character classes) with margin. */
const generateTemporaryPassword = () => {
	const required = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SYMBOLS)]
	const rest = Array.from({ length: 8 }, () => pick(ALL))
	return shuffle([...required, ...rest]).join('')
}

/**
 * Staff-only bypass for the password-reset-via-email path: sets a one-time temporary password (`Permanent:
 * false`) with no email sent at all. The user's next sign-in attempt with it comes back as a
 * `NEW_PASSWORD_REQUIRED` challenge (handled in `providers/cognito.ts`) rather than a normal success, forcing
 * them to choose their own real password before they're actually logged in - staff never learns the password
 * the account ends up using. Returns the generated password so staff can relay it to the user out-of-band
 * (phone, verified chat) - never via email, since that's the problem this exists for.
 */
export const adminSetTemporaryPassword = async (email: string) => {
	const temporaryPassword = generateTemporaryPassword()
	await cognito.adminSetUserPassword({
		UserPoolId: getEnv('COGNITO_USER_POOL_ID'),
		Username: email.toLowerCase(),
		Password: temporaryPassword,
		Permanent: false,
	})
	return { temporaryPassword }
}
