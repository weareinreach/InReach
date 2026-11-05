import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({ prisma: { user: { findUnique: vi.fn() } } }))
vi.mock('@weareinreach/auth/adminSetTemporaryPassword', () => ({
	adminSetTemporaryPassword: vi.fn().mockResolvedValue({ temporaryPassword: 'generated' }),
}))

const { prisma } = await import('@weareinreach/db')
const { adminSetTemporaryPassword } = await import('@weareinreach/auth/adminSetTemporaryPassword')
const { default: adminSetTemporaryPasswordHandler } =
	await import('./mutation.adminSetTemporaryPassword.handler')

const findUniqueMock = vi.mocked(prisma.user.findUnique)
const setPasswordMock = vi.mocked(adminSetTemporaryPassword)

/** `targetRole` is the single Data Portal role (if any) the target user currently has, via a direct grant. */
const mockTargetUser = (targetRole: string | null) => {
	findUniqueMock.mockResolvedValue({
		permissions: targetRole ? [{ permission: { name: targetRole } }] : [],
		roles: [],
	} as never)
}

const ctx = (permissions: string[]) => {
	const value = { session: { user: { permissions } } }
	return value as never
}

describe('adminSetTemporaryPassword - target-rank guard', () => {
	it('blocks an Admin from setting a temporary password on another Admin', async () => {
		mockTargetUser('dataPortalAdmin')
		await expect(
			adminSetTemporaryPasswordHandler({
				ctx: ctx(['dataPortalAdmin']),
				input: { email: 'target@inreach.org' },
			} as never)
		).rejects.toMatchObject({ code: 'FORBIDDEN' })
		expect(setPasswordMock).not.toHaveBeenCalled()
	})

	it('blocks an Admin from setting a temporary password on a root account', async () => {
		mockTargetUser('root')
		await expect(
			adminSetTemporaryPasswordHandler({
				ctx: ctx(['dataPortalAdmin']),
				input: { email: 'target@inreach.org' },
			} as never)
		).rejects.toMatchObject({ code: 'FORBIDDEN' })
		expect(setPasswordMock).not.toHaveBeenCalled()
	})

	it('allows an Admin to set a temporary password on a Manager-tier account', async () => {
		mockTargetUser('dataPortalManager')
		await adminSetTemporaryPasswordHandler({
			ctx: ctx(['dataPortalAdmin']),
			input: { email: 'target@inreach.org' },
		} as never)
		expect(setPasswordMock).toHaveBeenCalledWith('target@inreach.org')
	})

	it('allows an Admin to set a temporary password on a regular user with no Data Portal role', async () => {
		mockTargetUser(null)
		await adminSetTemporaryPasswordHandler({
			ctx: ctx(['dataPortalAdmin']),
			input: { email: 'target@example.org' },
		} as never)
		expect(setPasswordMock).toHaveBeenCalledWith('target@example.org')
	})

	it('allows root to set a temporary password on another root account', async () => {
		mockTargetUser('root')
		await adminSetTemporaryPasswordHandler({
			ctx: ctx(['root']),
			input: { email: 'target@inreach.org' },
		} as never)
		expect(setPasswordMock).toHaveBeenCalledWith('target@inreach.org')
	})
})
