import { InvalidParameterException, UserNotFoundException } from '@aws-sdk/client-cognito-identity-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const resendConfirmationCode = vi.fn()
const forgotPasswordMock = vi.fn()
vi.mock('./cognitoClient', () => ({
	cognito: {
		resendConfirmationCode: (...args: unknown[]) => resendConfirmationCode(...args),
		forgotPassword: (...args: unknown[]) => forgotPasswordMock(...args),
	},
	ClientId: 'test-client-id',
	generateHash: () => 'test-hash',
}))
vi.mock('./getBaseUrl', () => ({ getBaseUrl: () => 'https://example.com' }))

const { troubleLoggingIn } = await import('./troubleLoggingIn')

const metadata = { $metadata: {} }

/**
 * `troubleLoggingIn` backs the public "Trouble logging in?" flow - a single email-only entry point that must
 * pick the right real action (resend verification / send password reset / do nothing) without ever revealing
 * to the caller which one it picked. These tests exercise the actual `instanceof` branching against the real
 * AWS exception classes (not just an Error with a matching message/name), since that's what the
 * implementation actually checks.
 */
describe('troubleLoggingIn', () => {
	beforeEach(() => {
		resendConfirmationCode.mockReset()
		forgotPasswordMock.mockReset()
	})

	it('sends a verification code (and does not touch forgotPassword) when the account is unconfirmed', async () => {
		resendConfirmationCode.mockResolvedValueOnce({ CodeDeliveryDetails: {} })
		await expect(troubleLoggingIn('unconfirmed@example.com')).resolves.toEqual({ success: true })
		expect(forgotPasswordMock).not.toHaveBeenCalled()
	})

	it('falls back to sending a password reset when the account is already confirmed', async () => {
		resendConfirmationCode.mockRejectedValueOnce(
			new InvalidParameterException({
				message: 'User cannot be confirmed. Current status is CONFIRMED',
				...metadata,
			})
		)
		forgotPasswordMock.mockResolvedValueOnce({ CodeDeliveryDetails: {} })
		await expect(troubleLoggingIn('confirmed@example.com')).resolves.toEqual({ success: true })
		expect(forgotPasswordMock).toHaveBeenCalledTimes(1)
		expect(forgotPasswordMock).toHaveBeenCalledWith(
			expect.objectContaining({ Username: 'confirmed@example.com' })
		)
	})

	it('does nothing (and does not touch forgotPassword) when there is no account for that email at all', async () => {
		resendConfirmationCode.mockRejectedValueOnce(
			new UserNotFoundException({ message: 'User does not exist.', ...metadata })
		)
		await expect(troubleLoggingIn('no-account@example.com')).resolves.toEqual({ success: true })
		expect(forgotPasswordMock).not.toHaveBeenCalled()
	})

	it('still resolves success for a completely unexpected error, without touching forgotPassword', async () => {
		resendConfirmationCode.mockRejectedValueOnce(new Error('ThrottlingException'))
		await expect(troubleLoggingIn('whatever@example.com')).resolves.toEqual({ success: true })
		expect(forgotPasswordMock).not.toHaveBeenCalled()
	})

	it('still resolves success even if the password-reset fallback itself fails', async () => {
		resendConfirmationCode.mockRejectedValueOnce(
			new InvalidParameterException({
				message: 'User cannot be confirmed. Current status is CONFIRMED',
				...metadata,
			})
		)
		forgotPasswordMock.mockRejectedValueOnce(new Error('unexpected failure'))
		await expect(troubleLoggingIn('confirmed@example.com')).resolves.toEqual({ success: true })
	})

	it('always resolves the identical {success: true} shape regardless of which branch ran - the whole point of this endpoint', async () => {
		resendConfirmationCode.mockResolvedValueOnce({})
		const unconfirmedResult = await troubleLoggingIn('a@example.com')

		resendConfirmationCode.mockRejectedValueOnce(
			new InvalidParameterException({ message: 'already confirmed', ...metadata })
		)
		forgotPasswordMock.mockResolvedValueOnce({})
		const confirmedResult = await troubleLoggingIn('b@example.com')

		resendConfirmationCode.mockRejectedValueOnce(
			new UserNotFoundException({ message: 'no account', ...metadata })
		)
		const noAccountResult = await troubleLoggingIn('c@example.com')

		expect(unconfirmedResult).toEqual(confirmedResult)
		expect(confirmedResult).toEqual(noAccountResult)
	})
})
