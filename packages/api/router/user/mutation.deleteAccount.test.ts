import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({ getAuditedClient: vi.fn() }))
vi.mock('@weareinreach/auth/userLogin', () => ({ userLogin: vi.fn() }))
vi.mock('@weareinreach/auth/userLogout', () => ({ userSignOut: vi.fn() }))
vi.mock('@weareinreach/auth/deleteAccount', () => ({ deleteAccount: vi.fn() }))

const { getAuditedClient } = await import('@weareinreach/db')
const { userLogin } = await import('@weareinreach/auth/userLogin')
const { userSignOut } = await import('@weareinreach/auth/userLogout')
const { deleteAccount: cognitoDeleteAccount } = await import('@weareinreach/auth/deleteAccount')
const { default: deleteAccount } = await import('./mutation.deleteAccount.handler')

const getAuditedClientMock = vi.mocked(getAuditedClient)
const userLoginMock = vi.mocked(userLogin)
const userSignOutMock = vi.mocked(userSignOut)
const cognitoDeleteAccountMock = vi.mocked(cognitoDeleteAccount)

const actorId = 'user_test000000000000000000'
const ctxValue = { actorId, session: { user: { email: 'Person@Example.org' } } }
const ctx = ctxValue as never

/**
 * Regression: `userSignOut` was called with the user's email, but it looks up the `user_access_token` view by
 * the real user id - that lookup never matched anything, so it always threw and account deletion failed for
 * every user regardless of correct credentials.
 */
describe('user.deleteAccount - userSignOut gets the real user id, not the email', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('calls userSignOut with ctx.actorId, not the email', async () => {
		userLoginMock.mockResolvedValue({ success: true } as never)
		getAuditedClientMock.mockReturnValue({
			$transaction: vi.fn(async (callback: (tx: unknown) => unknown) =>
				callback({ user: { update: vi.fn() } })
			),
		} as never)

		await expect(deleteAccount({ ctx, input: 'correct-password' } as never)).resolves.toBe(true)

		expect(userSignOutMock).toHaveBeenCalledWith(actorId)
		expect(userSignOutMock).not.toHaveBeenCalledWith('person@example.org')
		expect(cognitoDeleteAccountMock).toHaveBeenCalledWith('person@example.org')
	})

	it('still rejects with incorrect credentials before touching anything else', async () => {
		userLoginMock.mockResolvedValue({ success: false } as never)

		await expect(deleteAccount({ ctx, input: 'wrong-password' } as never)).rejects.toMatchObject({
			code: 'UNAUTHORIZED',
		})
		expect(userSignOutMock).not.toHaveBeenCalled()
	})
})
