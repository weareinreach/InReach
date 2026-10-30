import { describe, expect, it, vi } from 'vitest'

const resendConfirmationCode = vi.fn()
vi.mock('./cognitoClient', () => ({
	cognito: { resendConfirmationCode: (...args: unknown[]) => resendConfirmationCode(...args) },
	ClientId: 'test-client-id',
	generateHash: () => 'test-hash',
}))

const { resendVerificationCode, resendVerificationCodeSafe } = await import('./resendCode')

/**
 * Regression coverage for a real email-enumeration vulnerability: `resendVerificationCodeSafe` is the public,
 * unauthenticated endpoint backing both the login form's "Request a new code" button and the "Trouble logging
 * in?" flow. Cognito throws a distinct, well-documented exception depending on account state (no account /
 * already confirmed / unconfirmed-so-it-just-works), and the handler used to forward that exception's message
 * straight to the caller (packages/api/lib/errorHandler.ts's catch-all) - letting anyone learn whether an
 * arbitrary email has an account at all, and whether it's verified, just from the response.
 * `resendVerificationCodeSafe` must always resolve the same way regardless of what actually happened, with
 * the real outcome logged server-side only.
 */
describe('resendVerificationCodeSafe', () => {
	it('resolves {success: true} when the account is unconfirmed and the real resend succeeds', async () => {
		resendConfirmationCode.mockResolvedValueOnce({ CodeDeliveryDetails: {} })
		await expect(resendVerificationCodeSafe('real@example.com')).resolves.toEqual({ success: true })
	})

	it('resolves identically when the email has no account at all (UserNotFoundException)', async () => {
		resendConfirmationCode.mockRejectedValueOnce(new Error('UserNotFoundException'))
		await expect(resendVerificationCodeSafe('no-account@example.com')).resolves.toEqual({ success: true })
	})

	it('resolves identically when the account already exists and is already confirmed (InvalidParameterException)', async () => {
		resendConfirmationCode.mockRejectedValueOnce(new Error('InvalidParameterException'))
		await expect(resendVerificationCodeSafe('already-confirmed@example.com')).resolves.toEqual({
			success: true,
		})
	})

	it('resolves identically even for a completely unexpected error', async () => {
		resendConfirmationCode.mockRejectedValueOnce(new Error('ThrottlingException'))
		await expect(resendVerificationCodeSafe('whatever@example.com')).resolves.toEqual({ success: true })
	})

	it('never throws, regardless of what the underlying Cognito call does', async () => {
		resendConfirmationCode.mockRejectedValueOnce('not even an Error instance')
		await expect(resendVerificationCodeSafe('odd@example.com')).resolves.toEqual({ success: true })
	})
})

describe('resendVerificationCode (the real, non-safe call staff tooling uses)', () => {
	it('still propagates the real error - adminResendCode relies on this to show staff the actual reason', async () => {
		resendConfirmationCode.mockRejectedValueOnce(new Error('InvalidParameterException'))
		await expect(resendVerificationCode('already-confirmed@example.com')).rejects.toThrow(
			'InvalidParameterException'
		)
	})
})
