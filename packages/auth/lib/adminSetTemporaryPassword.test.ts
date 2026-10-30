import { describe, expect, it, vi } from 'vitest'

const adminSetUserPassword = vi.fn()
vi.mock('./cognitoClient', () => ({
	cognito: { adminSetUserPassword: (...args: unknown[]) => adminSetUserPassword(...args) },
}))
vi.mock('@weareinreach/env', () => ({ getEnv: () => 'test-user-pool-id' }))

const { adminSetTemporaryPassword } = await import('./adminSetTemporaryPassword')

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#%^&*]).{8,}$/

/**
 * `adminSetTemporaryPassword` backs the staff "Set Temporary Password" Data Portal action - the bypass for
 * when a password-reset email can't reach the user at all. It generates the password itself (Cognito's
 * AdminSetUserPassword requires the caller to supply one), so these tests cover that the generated password
 * actually satisfies Cognito's policy and that the account is left in the right state (Permanent: false,
 * forcing the user to choose their own real password on next login).
 */
describe('adminSetTemporaryPassword', () => {
	it('generates a password satisfying Cognito default policy (upper, lower, digit, symbol, 8+ chars)', async () => {
		adminSetUserPassword.mockResolvedValueOnce({})
		const { temporaryPassword } = await adminSetTemporaryPassword('user@example.com')
		expect(temporaryPassword).toMatch(PASSWORD_POLICY)
	})

	it('sets the password as temporary (Permanent: false), not permanent', async () => {
		adminSetUserPassword.mockResolvedValueOnce({})
		await adminSetTemporaryPassword('user@example.com')

		expect(adminSetUserPassword).toHaveBeenCalledWith(
			expect.objectContaining({
				Permanent: false,
				UserPoolId: 'test-user-pool-id',
				Username: 'user@example.com',
			})
		)
	})

	it('lowercases the username', async () => {
		adminSetUserPassword.mockResolvedValueOnce({})
		await adminSetTemporaryPassword('User@Example.com')

		expect(adminSetUserPassword).toHaveBeenCalledWith(
			expect.objectContaining({ Username: 'user@example.com' })
		)
	})

	it('generates a different password on each call', async () => {
		adminSetUserPassword.mockResolvedValue({})
		const first = await adminSetTemporaryPassword('user@example.com')
		const second = await adminSetTemporaryPassword('user@example.com')

		expect(first.temporaryPassword).not.toEqual(second.temporaryPassword)
	})

	it('propagates a real Cognito failure (e.g. user does not exist) rather than swallowing it', async () => {
		adminSetUserPassword.mockRejectedValueOnce(new Error('UserNotFoundException'))
		await expect(adminSetTemporaryPassword('nobody@example.com')).rejects.toThrow('UserNotFoundException')
	})
})
