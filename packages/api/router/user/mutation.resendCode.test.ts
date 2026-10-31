import { beforeEach, describe, expect, it, vi } from 'vitest'

const resendVerificationCodeSafeMock = vi.fn().mockResolvedValue({ success: true })
vi.mock('@weareinreach/auth/resendCode', () => ({
	resendVerificationCodeSafe: (...args: unknown[]) => resendVerificationCodeSafeMock(...args),
}))
const checkRateLimitMock = vi.fn().mockResolvedValue(true)
vi.mock('@weareinreach/util/rateLimit', () => ({
	checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
}))

const { default: resendCode } = await import('./mutation.resendCode.handler')

describe('user.resendCode - rate limiting', () => {
	beforeEach(() => {
		checkRateLimitMock.mockReset().mockResolvedValue(true)
		resendVerificationCodeSafeMock.mockClear()
	})

	it('calls resendVerificationCodeSafe when under the rate limit', async () => {
		await resendCode({ input: { email: 'user@example.com' } } as never)

		expect(resendVerificationCodeSafeMock).toHaveBeenCalledWith('user@example.com')
	})

	/**
	 * Regression: this endpoint's whole purpose is a response that never differs based on outcome - rate
	 * limiting must not become a new way to distinguish states, so it stays silent (still {success: true})
	 * instead of throwing. Also prevents email-bombing a target's inbox.
	 */
	it('skips the real call but still returns {success: true} once the limit is exceeded', async () => {
		checkRateLimitMock.mockResolvedValueOnce(false)

		const result = await resendCode({ input: { email: 'user@example.com' } } as never)

		expect(result).toEqual({ success: true })
		expect(resendVerificationCodeSafeMock).not.toHaveBeenCalled()
	})
})
