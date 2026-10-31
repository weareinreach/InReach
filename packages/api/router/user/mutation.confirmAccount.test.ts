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
const { CodeMismatchException, ExpiredCodeException } = await import('@weareinreach/auth/confirmAccount')

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

/**
 * Regression: anything other than CodeMismatchException/ExpiredCodeException (e.g. Cognito's
 * UserNotFoundException for "no such account", or NotAuthorizedException for "already confirmed") was
 * previously re-thrown as-is, passing Cognito's raw exception straight through to the client - including as
 * `cause`, which the login modal (AccountVerified.tsx) reads `cause.name` from to decide what to show. That
 * let an anonymous caller distinguish "no such account" from "already confirmed" from "wrong code" via either
 * the message or the cause name.
 */
describe('user.confirmAccount - does not leak which real error occurred', () => {
	beforeEach(() => {
		checkRateLimitMock.mockReset().mockResolvedValue(true)
	})

	it('keeps a specific message and cause for a wrong code', async () => {
		const err = new CodeMismatchException({ message: 'raw cognito message', $metadata: {} })
		cognitoConfirmAccountMock.mockRejectedValueOnce(err)

		await expect(
			confirmAccount({ input: { email: 'user@example.com', code: '000000' } } as never)
		).rejects.toMatchObject({ message: 'Code mismatch', cause: err })
	})

	it('keeps a specific message and cause for an expired code', async () => {
		const err = new ExpiredCodeException({ message: 'raw cognito message', $metadata: {} })
		cognitoConfirmAccountMock.mockRejectedValueOnce(err)

		await expect(
			confirmAccount({ input: { email: 'user@example.com', code: '000000' } } as never)
		).rejects.toMatchObject({ message: 'Code expired', cause: err })
	})

	it('generifies an unrelated Cognito exception (e.g. no such account) and drops its cause', async () => {
		class UserNotFoundException extends Error {}
		const err = new UserNotFoundException('User does not exist.')
		cognitoConfirmAccountMock.mockRejectedValueOnce(err)

		await expect(
			confirmAccount({ input: { email: 'user@example.com', code: '000000' } } as never)
		).rejects.toMatchObject({ message: 'Invalid or expired code', cause: undefined })
	})

	it('generifies a different unrelated exception the same way (e.g. already confirmed)', async () => {
		class NotAuthorizedException extends Error {}
		const err = new NotAuthorizedException('User cannot be confirmed. Current status is CONFIRMED')
		cognitoConfirmAccountMock.mockRejectedValueOnce(err)

		await expect(
			confirmAccount({ input: { email: 'user@example.com', code: '000000' } } as never)
		).rejects.toMatchObject({ message: 'Invalid or expired code', cause: undefined })
	})
})
