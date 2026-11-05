import { beforeEach, describe, expect, it, vi } from 'vitest'

const troubleLoggingInMock = vi.fn().mockResolvedValue({ success: true })
vi.mock('@weareinreach/auth/troubleLoggingIn', () => ({
	troubleLoggingIn: (...args: unknown[]) => troubleLoggingInMock(...args),
}))
const checkRateLimitMock = vi.fn().mockResolvedValue(true)
vi.mock('@weareinreach/util/rateLimit', () => ({
	checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
}))

const { default: troubleLoggingInHandler } = await import('./mutation.troubleLoggingIn.handler')

describe('user.troubleLoggingIn - rate limiting', () => {
	beforeEach(() => {
		checkRateLimitMock.mockReset().mockResolvedValue(true)
		troubleLoggingInMock.mockClear()
	})

	it('calls troubleLoggingIn when under the rate limit', async () => {
		await troubleLoggingInHandler({ input: { email: 'user@example.com' } } as never)

		expect(troubleLoggingInMock).toHaveBeenCalledWith('user@example.com')
	})

	it('skips the real call but still returns {success: true} once the limit is exceeded', async () => {
		checkRateLimitMock.mockResolvedValueOnce(false)

		const result = await troubleLoggingInHandler({ input: { email: 'user@example.com' } } as never)

		expect(result).toEqual({ success: true })
		expect(troubleLoggingInMock).not.toHaveBeenCalled()
	})
})
