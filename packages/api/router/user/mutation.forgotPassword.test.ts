import { beforeEach, describe, expect, it, vi } from 'vitest'

const forgotPasswordSafeMock = vi.fn().mockResolvedValue({ success: true })
vi.mock('@weareinreach/auth/forgotPassword', () => ({
	forgotPasswordSafe: (...args: unknown[]) => forgotPasswordSafeMock(...args),
}))
const checkRateLimitMock = vi.fn().mockResolvedValue(true)
vi.mock('@weareinreach/util/rateLimit', () => ({
	checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
}))

const { default: forgotPassword } = await import('./mutation.forgotPassword.handler')

describe('user.forgotPassword - rate limiting', () => {
	beforeEach(() => {
		checkRateLimitMock.mockReset().mockResolvedValue(true)
		forgotPasswordSafeMock.mockClear()
	})

	it('calls forgotPasswordSafe when under the rate limit', async () => {
		const input = { email: 'user@example.com', subject: 'Reset your password', message: 'msg' }
		await forgotPassword({ input } as never)

		expect(forgotPasswordSafeMock).toHaveBeenCalledWith(input)
	})

	/**
	 * Regression: this endpoint's whole purpose is a response that never differs based on outcome - rate
	 * limiting must not become a new way to distinguish states, so it stays silent (still {success: true})
	 * instead of throwing.
	 */
	it('skips the real call but still returns {success: true} once the limit is exceeded', async () => {
		checkRateLimitMock.mockResolvedValueOnce(false)

		const result = await forgotPassword({
			input: { email: 'user@example.com', subject: 'Reset your password', message: 'msg' },
		} as never)

		expect(result).toEqual({ success: true })
		expect(forgotPasswordSafeMock).not.toHaveBeenCalled()
	})
})
