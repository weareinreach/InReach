import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({ getAuditedClient: vi.fn() }))
vi.mock('@weareinreach/auth/createUser', () => ({ createCognitoUser: vi.fn() }))
vi.mock('@weareinreach/auth/deleteCognitoUser', () => ({ deleteCognitoUser: vi.fn() }))

const { getAuditedClient } = await import('@weareinreach/db')
const { createCognitoUser } = await import('@weareinreach/auth/createUser')
const { deleteCognitoUser } = await import('@weareinreach/auth/deleteCognitoUser')
const { default: create } = await import('./mutation.create.handler')

const getAuditedClientMock = vi.mocked(getAuditedClient)
const createCognitoUserMock = vi.mocked(createCognitoUser)
const deleteCognitoUserMock = vi.mocked(deleteCognitoUser)

const inputValue = {
	prisma: { data: { id: 'user_new00000000000000000000' }, select: { id: true } },
	cognito: { databaseId: 'user_new00000000000000000000', email: 'person@example.org', password: 'whatever' },
}
const input = inputValue as never

/**
 * Public signup must never reveal whether an email already has an account (a real enumeration bug - a
 * distinguishable "User already exists" error, checked by the client to show a different UI state) or leave
 * an orphaned Cognito user behind when the database write after it fails (#2104, filed and left open for over
 * a month before this fix).
 */
describe('user.create - no account enumeration, no orphaned Cognito user on failure', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('resolves the same generic success whether or not the email is already taken', async () => {
		getAuditedClientMock.mockReturnValue({
			user: { findUnique: vi.fn().mockResolvedValue({ id: 'user_existing' }) },
		} as never)

		await expect(create({ input } as never)).resolves.toEqual({ success: true })
		expect(createCognitoUserMock).not.toHaveBeenCalled()
	})

	it('creates the Cognito user and the database row for a genuinely new email', async () => {
		const userCreateMock = vi.fn().mockResolvedValue({ id: inputValue.cognito.databaseId })
		const accountCreateMock = vi.fn()
		getAuditedClientMock.mockReturnValue({
			user: { findUnique: vi.fn().mockResolvedValue(null) },
			$transaction: vi.fn(async (callback: (tx: unknown) => unknown) =>
				callback({ user: { create: userCreateMock }, account: { create: accountCreateMock } })
			),
		} as never)
		createCognitoUserMock.mockResolvedValue({
			cognitoId: 'cognito-sub',
			prismaAccount: { data: { provider: 'cognito' } },
		} as never)

		await expect(create({ input } as never)).resolves.toEqual({ success: true })
		expect(userCreateMock).toHaveBeenCalled()
		expect(accountCreateMock).toHaveBeenCalled()
		expect(deleteCognitoUserMock).not.toHaveBeenCalled()
	})

	it('deletes the just-created Cognito user if the database write fails afterward (#2104)', async () => {
		getAuditedClientMock.mockReturnValue({
			user: { findUnique: vi.fn().mockResolvedValue(null) },
			$transaction: vi.fn().mockRejectedValue(new Error('constraint violation')),
		} as never)
		createCognitoUserMock.mockResolvedValue({ cognitoId: 'cognito-sub' } as never)

		// Still resolves the same generic success - the failure is logged internally, not surfaced.
		await expect(create({ input } as never)).resolves.toEqual({ success: true })
		expect(deleteCognitoUserMock).toHaveBeenCalledWith(inputValue.cognito.email)
	})

	it('does not attempt a database write if Cognito itself fails', async () => {
		const transactionMock = vi.fn()
		getAuditedClientMock.mockReturnValue({
			user: { findUnique: vi.fn().mockResolvedValue(null) },
			$transaction: transactionMock,
		} as never)
		createCognitoUserMock.mockResolvedValue(undefined)

		await expect(create({ input } as never)).resolves.toEqual({ success: true })
		expect(transactionMock).not.toHaveBeenCalled()
		expect(deleteCognitoUserMock).not.toHaveBeenCalled()
	})
})
