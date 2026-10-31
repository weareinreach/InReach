import { beforeEach, describe, expect, it, vi } from 'vitest'

const cognitoConfirmAccountMock = vi.fn().mockResolvedValue({ success: true })
vi.mock('@weareinreach/auth/confirmAccount', () => ({
	confirmAccount: (...args: unknown[]) => cognitoConfirmAccountMock(...args),
	CodeMismatchException: class CodeMismatchException extends Error {},
	ExpiredCodeException: class ExpiredCodeException extends Error {},
}))
const checkRateLimitMock = vi.fn().mockResolvedValue(true)
vi.mock('@weareinreach/util/rateLimit', () => ({
	checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
}))
vi.mock('@weareinreach/db', () => ({
	prisma: {
		user: {
			findFirstOrThrow: vi.fn().mockResolvedValue({ id: 'user_test' }),
			update: vi.fn().mockResolvedValue({}),
		},
	},
}))

const { default: confirmAccount } = await import('./mutation.confirmAccount.handler')

describe('user.confirmAccount - rate limiting', () => {
	beforeEach(() => {
		checkRateLimitMock.mockReset().mockResolvedValue(true)
		cognitoConfirmAccountMock.mockClear()
	})

	it('calls Cognito when under the rate limit', async () => {
		await confirmAccount({ input: { email: 'user@example.com', code: '123456' } } as never)

		expect(cognitoConfirmAccountMock).toHaveBeenCalledWith('user@example.com', '123456')
	})

	it('throws TOO_MANY_REQUESTS and never calls Cognito once the limit is exceeded', async () => {
		checkRateLimitMock.mockResolvedValueOnce(false)

		await expect(
			confirmAccount({ input: { email: 'user@example.com', code: '123456' } } as never)
		).rejects.toMatchObject({ code: 'TOO_MANY_REQUESTS' })
		expect(cognitoConfirmAccountMock).not.toHaveBeenCalled()
	})
})
