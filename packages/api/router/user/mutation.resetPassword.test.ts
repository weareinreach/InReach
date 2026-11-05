import { beforeEach, describe, expect, it, vi } from 'vitest'

const cognitoResetPasswordMock = vi.fn().mockResolvedValue({ success: true })
vi.mock('@weareinreach/auth/resetPassword', () => ({
	resetPassword: (...args: unknown[]) => cognitoResetPasswordMock(...args),
}))
const checkRateLimitMock = vi.fn().mockResolvedValue(true)
vi.mock('@weareinreach/util/rateLimit', () => ({
	checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
}))

const { default: resetPassword } = await import('./mutation.resetPassword.handler')

describe('user.resetPassword - rate limiting', () => {
	beforeEach(() => {
		checkRateLimitMock.mockReset().mockResolvedValue(true)
		cognitoResetPasswordMock.mockClear()
	})

	it('calls Cognito when under the rate limit', async () => {
		await resetPassword({
			input: { email: 'USER@Example.com', password: 'new-password', code: '123456' },
		} as never)

		expect(cognitoResetPasswordMock).toHaveBeenCalledWith({
			email: 'user@example.com',
			password: 'new-password',
			code: '123456',
		})
	})

	it('throws TOO_MANY_REQUESTS and never calls Cognito once the limit is exceeded', async () => {
		checkRateLimitMock.mockResolvedValueOnce(false)

		await expect(
			resetPassword({
				input: { email: 'user@example.com', password: 'new-password', code: '123456' },
			} as never)
		).rejects.toMatchObject({ code: 'TOO_MANY_REQUESTS' })
		expect(cognitoResetPasswordMock).not.toHaveBeenCalled()
	})
})
