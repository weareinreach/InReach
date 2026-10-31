import { UserNotConfirmedException } from '@aws-sdk/client-cognito-identity-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const userLoginMock = vi.fn()
vi.mock('~auth/lib/userLogin', () => ({ userLogin: (...args: unknown[]) => userLoginMock(...args) }))

const checkRateLimitMock = vi.fn().mockResolvedValue(true)
vi.mock('@weareinreach/util/rateLimit', () => ({
	checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
}))

const { cognitoCredentialProvider } = await import('./cognito')

// NextAuth's `Credentials(options)` factory doesn't spread `options` onto the returned provider object - the
// top-level `authorize` it returns is a hardcoded `() => null` stub, and the function actually written in
// cognito.ts only lives at `.options.authorize`. Calling `.authorize` directly here would silently test
// nothing (always null, unaffected by any mock) and give false confidence.
const authorize = cognitoCredentialProvider.options.authorize as (
	credentials: Record<'email' | 'password', string> | undefined,
	req: unknown
) => Promise<unknown>

const CREDENTIALS = { email: 'user@example.com', password: 'whatever-was-typed' }

/**
 * `authorize()` is the one place that decides what the login form actually sees (`signIn()`'s `result.error`
 * is whatever string this throws) for every possible outcome of a Cognito login attempt - unconfirmed
 * account, a staff-set temporary password, wrong password, or success. It had no test coverage at all before
 * this (neither this file nor `userLogin`/`cognitoClient` test anything at this layer), so both branches
 * added this session (`UserNotConfirmed`, `NewPasswordRequired`) were previously unverified beyond the UI
 * tests that mock `signIn` itself and never actually run this function.
 */
describe('cognitoCredentialProvider.authorize', () => {
	beforeEach(() => {
		checkRateLimitMock.mockReset().mockResolvedValue(true)
		userLoginMock.mockClear()
	})

	it('returns null without calling userLogin when email is missing', async () => {
		await expect(authorize({ email: '', password: 'x' }, {})).resolves.toBeNull()
		expect(userLoginMock).not.toHaveBeenCalled()
	})

	it('returns null without calling userLogin when password is missing', async () => {
		await expect(authorize({ email: 'user@example.com', password: '' }, {})).resolves.toBeNull()
		expect(userLoginMock).not.toHaveBeenCalled()
	})

	it('returns the user on a successful login', async () => {
		const user = { id: 'u1', email: 'user@example.com' }
		userLoginMock.mockResolvedValueOnce({ success: true, session: {}, user })

		await expect(authorize(CREDENTIALS, {})).resolves.toBe(user)
	})

	it('throws "NewPasswordRequired" for a NEW_PASSWORD_REQUIRED challenge', async () => {
		userLoginMock.mockResolvedValueOnce({
			success: undefined,
			challengeName: 'NEW_PASSWORD_REQUIRED',
			challengeParams: {},
			challengeSession: 'session-token',
		})

		await expect(authorize(CREDENTIALS, {})).rejects.toThrow('NewPasswordRequired')
	})

	it('throws the generic "CredentialsSignin" for a challenge type other than NEW_PASSWORD_REQUIRED', async () => {
		userLoginMock.mockResolvedValueOnce({
			success: undefined,
			challengeName: 'SMS_MFA',
			challengeParams: {},
			challengeSession: 'session-token',
		})

		await expect(authorize(CREDENTIALS, {})).rejects.toThrow('CredentialsSignin')
	})

	it('throws the generic "CredentialsSignin" when the password is simply wrong', async () => {
		userLoginMock.mockResolvedValueOnce({ success: false, session: undefined, user: undefined })

		await expect(authorize(CREDENTIALS, {})).rejects.toThrow('CredentialsSignin')
	})

	it('throws "UserNotConfirmed" when userLogin rejects with UserNotConfirmedException', async () => {
		userLoginMock.mockRejectedValueOnce(
			new UserNotConfirmedException({ message: 'User is not confirmed.', $metadata: {} })
		)

		await expect(authorize(CREDENTIALS, {})).rejects.toThrow('UserNotConfirmed')
	})

	it('re-throws any other real Error from userLogin as-is', async () => {
		const unexpected = new Error('ThrottlingException')
		userLoginMock.mockRejectedValueOnce(unexpected)

		await expect(authorize(CREDENTIALS, {})).rejects.toBe(unexpected)
	})

	it('wraps a non-Error rejection as the generic "CredentialsSignin"', async () => {
		userLoginMock.mockRejectedValueOnce('not even an Error instance')

		await expect(authorize(CREDENTIALS, {})).rejects.toThrow('CredentialsSignin')
	})

	/**
	 * Regression: there was previously no app-level throttling on login at all - nothing stopped unlimited
	 * password guesses against a known email.
	 */
	it('throws "TooManyRequests" and never calls userLogin once the rate limit is exceeded', async () => {
		checkRateLimitMock.mockResolvedValueOnce(false)

		await expect(authorize(CREDENTIALS, {})).rejects.toThrow('TooManyRequests')
		expect(userLoginMock).not.toHaveBeenCalled()
	})
})
