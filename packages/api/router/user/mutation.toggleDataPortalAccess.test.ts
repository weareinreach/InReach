import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({ getAuditedClient: vi.fn() }))

const { getAuditedClient } = await import('@weareinreach/db')
const { default: toggleDataPortalAccess } = await import('./mutation.toggleDataPortalAccess.handler')

const getAuditedClientMock = vi.mocked(getAuditedClient)

const PORTAL_PERMISSIONS = [
	{ id: 'perm_root', name: 'root' },
	{ id: 'perm_admin', name: 'dataPortalAdmin' },
	{ id: 'perm_manager', name: 'dataPortalManager' },
	{ id: 'perm_basic', name: 'dataPortalBasic' },
]

/** `targetCurrentRole` is whatever the target's CURRENT best role is, read inside the transaction. */
const mockPrisma = (targetCurrentRole: string | null) => {
	const tx = {
		$queryRaw: vi.fn().mockResolvedValue(undefined),
		userPermission: {
			findFirst: vi
				.fn()
				.mockResolvedValue(targetCurrentRole ? { permission: { name: targetCurrentRole } } : null),
			deleteMany: vi.fn(),
			upsert: vi.fn(),
		},
	}
	getAuditedClientMock.mockReturnValue({
		permission: { findMany: vi.fn().mockResolvedValue(PORTAL_PERMISSIONS) },
		userPermission: {
			// Called again after the transaction to report the new state - not under test here, just needs
			// to resolve to something.
			findFirst: vi.fn().mockResolvedValue(null),
		},
		$transaction: vi.fn(async (callback: (t: typeof tx) => unknown) => callback(tx)),
	} as never)
	return tx
}

const ctx = (permissions: string[], email = 'staff@inreach.org') => {
	const value = { session: { user: { permissions, email } } }
	return value as never
}

const baseInput = { userId: 'user_target000000000000000000' }

describe('toggleDataPortalAccess - privilege escalation guards', () => {
	it('blocks a Manager granting Admin (cannot assign higher than your own rank)', async () => {
		mockPrisma(null)
		await expect(
			toggleDataPortalAccess({
				ctx: ctx(['dataPortalManager']),
				input: { ...baseInput, action: 'allow', permissionId: 'dataPortalAdmin' },
			} as never)
		).rejects.toMatchObject({ code: 'FORBIDDEN' })
	})

	it('blocks a non-root internal Admin from granting root', async () => {
		mockPrisma(null)
		await expect(
			toggleDataPortalAccess({
				ctx: ctx(['dataPortalAdmin']),
				input: { ...baseInput, action: 'allow', permissionId: 'root' },
			} as never)
		).rejects.toMatchObject({ code: 'FORBIDDEN' })
	})

	it('allows a root, internal actor to grant root', async () => {
		const tx = mockPrisma(null)
		await toggleDataPortalAccess({
			ctx: ctx(['root']),
			input: { ...baseInput, action: 'allow', permissionId: 'root' },
		} as never)
		expect(tx.userPermission.upsert).toHaveBeenCalled()
	})

	it('blocks a non-root Admin from stripping root via an explicit deny', async () => {
		mockPrisma('root')
		await expect(
			toggleDataPortalAccess({
				ctx: ctx(['dataPortalAdmin']),
				input: { ...baseInput, action: 'deny' },
			} as never)
		).rejects.toMatchObject({ code: 'FORBIDDEN' })
	})

	it('blocks a non-root Admin from downgrading a root user to a lower tier via allow', async () => {
		mockPrisma('root')
		await expect(
			toggleDataPortalAccess({
				ctx: ctx(['dataPortalAdmin']),
				input: { ...baseInput, action: 'allow', permissionId: 'dataPortalManager' },
			} as never)
		).rejects.toMatchObject({ code: 'FORBIDDEN' })
	})

	it('allows a root, internal actor to demote another root user', async () => {
		const tx = mockPrisma('root')
		await toggleDataPortalAccess({
			ctx: ctx(['root']),
			input: { ...baseInput, action: 'deny' },
		} as never)
		expect(tx.userPermission.deleteMany).toHaveBeenCalled()
	})

	it('allows an Admin to grant Manager to a target with no current role', async () => {
		const tx = mockPrisma(null)
		await toggleDataPortalAccess({
			ctx: ctx(['dataPortalAdmin']),
			input: { ...baseInput, action: 'allow', permissionId: 'dataPortalManager' },
		} as never)
		expect(tx.userPermission.upsert).toHaveBeenCalled()
	})
})
