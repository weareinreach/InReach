import { describe, expect, it, vi } from 'vitest'

const forgotPasswordMock = vi.fn()
vi.mock('./cognitoClient', () => ({
	cognito: { forgotPassword: (...args: unknown[]) => forgotPasswordMock(...args) },
	ClientId: 'test-client-id',
	generateHash: () => 'test-hash',
}))
vi.mock('./getBaseUrl', () => ({ getBaseUrl: () => 'https://example.com' }))

const { forgotPassword, forgotPasswordSafe } = await import('./forgotPassword')

const input = { email: 'user@example.com', subject: 'Reset your password', message: 'Click here:' }

/**
 * Same enumeration-prevention property as resendCode.test.ts's `resendVerificationCodeSafe` coverage, applied
 * to the sibling public endpoint - see that file's doc comment for the full vulnerability history. Cognito
 * refuses to reset a password for an unconfirmed account (a distinct exception from "no account at all"),
 * which is exactly the kind of distinguishing detail `forgotPasswordSafe` must never leak.
 */
describe('forgotPasswordSafe', () => {
	it('resolves {success: true} when the account is confirmed and the real reset succeeds', async () => {
		forgotPasswordMock.mockResolvedValueOnce({ CodeDeliveryDetails: {} })
		await expect(forgotPasswordSafe(input)).resolves.toEqual({ success: true })
	})

	it('resolves identically when the email has no account at all (UserNotFoundException)', async () => {
		forgotPasswordMock.mockRejectedValueOnce(new Error('UserNotFoundException'))
		await expect(forgotPasswordSafe(input)).resolves.toEqual({ success: true })
	})

	it('resolves identically when the account exists but is not confirmed yet (InvalidParameterException)', async () => {
		forgotPasswordMock.mockRejectedValueOnce(new Error('InvalidParameterException'))
		await expect(forgotPasswordSafe(input)).resolves.toEqual({ success: true })
	})

	it('never throws, regardless of what the underlying Cognito call does', async () => {
		forgotPasswordMock.mockRejectedValueOnce('not even an Error instance')
		await expect(forgotPasswordSafe(input)).resolves.toEqual({ success: true })
	})
})

describe('forgotPassword (the real, non-safe call staff tooling uses)', () => {
	it('still propagates the real error - adminResetPassword relies on this to show staff the actual reason', async () => {
		forgotPasswordMock.mockRejectedValueOnce(new Error('InvalidParameterException'))
		await expect(forgotPassword(input)).rejects.toThrow('InvalidParameterException')
	})
})
