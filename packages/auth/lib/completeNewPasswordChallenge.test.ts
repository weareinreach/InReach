import { beforeEach, describe, expect, it, vi } from 'vitest'

const userLoginMock = vi.fn()
vi.mock('./userLogin', () => ({ userLogin: (...args: unknown[]) => userLoginMock(...args) }))

const changePasswordResponseMock = vi.fn()
vi.mock('./changePassword', () => ({
	changePasswordResponse: (...args: unknown[]) => changePasswordResponseMock(...args),
}))

const { completeNewPasswordChallenge, InvalidTemporaryPasswordError, UnexpectedChallengeError } =
	await import('./completeNewPasswordChallenge')

/**
 * `completeNewPasswordChallenge` is the server side of the login form's "set a new password" step, for a user
 * signing in with a staff-set temporary password (NEW_PASSWORD_REQUIRED challenge). It has to re-authenticate
 * with the temporary password to get a fresh challenge session (the original one from
 * `providers/cognito.ts`'s login attempt never reaches the client) before it can respond to the challenge
 * with the user's chosen new password - these tests cover that it only proceeds for a genuine
 * NEW_PASSWORD_REQUIRED challenge and fails clearly otherwise.
 */
describe('completeNewPasswordChallenge', () => {
	beforeEach(() => {
		userLoginMock.mockReset()
		changePasswordResponseMock.mockReset()
	})

	it('responds to a NEW_PASSWORD_REQUIRED challenge with the new password and the fresh session', async () => {
		userLoginMock.mockResolvedValueOnce({
			success: undefined,
			challengeName: 'NEW_PASSWORD_REQUIRED',
			challengeParams: {},
			challengeSession: 'fresh-session-token',
		})
		changePasswordResponseMock.mockResolvedValueOnce({ success: true, session: {}, user: {} })

		const result = await completeNewPasswordChallenge('user@example.com', 'temp-pw', 'new-real-pw')

		expect(changePasswordResponseMock).toHaveBeenCalledWith(
			'user@example.com',
			'new-real-pw',
			'fresh-session-token'
		)
		expect(result).toEqual({ success: true, session: {}, user: {} })
	})

	it('rejects with InvalidTemporaryPasswordError when the temporary password is wrong, without touching changePasswordResponse', async () => {
		userLoginMock.mockResolvedValueOnce({ success: false, session: undefined, user: undefined })

		await expect(
			completeNewPasswordChallenge('user@example.com', 'wrong-temp-pw', 'new-real-pw')
		).rejects.toThrow(InvalidTemporaryPasswordError)
		expect(changePasswordResponseMock).not.toHaveBeenCalled()
	})

	it('rejects with UnexpectedChallengeError for a challenge type other than NEW_PASSWORD_REQUIRED', async () => {
		userLoginMock.mockResolvedValueOnce({
			success: undefined,
			challengeName: 'SMS_MFA',
			challengeParams: {},
			challengeSession: 'fresh-session-token',
		})

		await expect(completeNewPasswordChallenge('user@example.com', 'temp-pw', 'new-real-pw')).rejects.toThrow(
			UnexpectedChallengeError
		)
		expect(changePasswordResponseMock).not.toHaveBeenCalled()
	})

	it('returns the success result directly if the temporary password somehow already completes sign-in', async () => {
		userLoginMock.mockResolvedValueOnce({ success: true, session: {}, user: { id: 'u1' } })

		const result = await completeNewPasswordChallenge('user@example.com', 'temp-pw', 'new-real-pw')

		expect(result).toEqual({ success: true, session: {}, user: { id: 'u1' } })
		expect(changePasswordResponseMock).not.toHaveBeenCalled()
	})
})
