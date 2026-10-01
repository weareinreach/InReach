import { describe, expect, it } from 'vitest'

import { permissions as realPermissions } from '@weareinreach/db/generated/permission'
import { ROOT_TIER_PERMISSIONS } from '@weareinreach/db/lib/rootTierPermissions'

import { type Context } from '../context'
import { type Meta } from '../initTRPC'
import { checkPermissions, checkStaffPermissions } from './permissions'

/**
 * Regression coverage for a real defect found while scoping Bulk Search & Replace:
 * `permissionedProcedure(key)` only actually blocks a request when `key` maps to a permission string on
 * `checkPermissions`' manager/admin blocklists (`dataPortalManager`, `dataPortalAdmin`, etc.) - any other key
 * falls through to `return true` for _any_ signed-in Data Portal staff, regardless of tier. Reusing
 * `attachServiceTags`'s existing procedure (gated at `['editAnyOrg', 'createOrg']`, neither of which is on
 * that blocklist) for a new dataPortalManager-only bulk action would have silently let a dataPortalBasic
 * session through. Every new procedure this feature adds must be independently verified to actually reject
 * Basic-tier and accept Manager-tier - this file is that check, not a general permissions test suite.
 */
const makeCtx = (permissions: string[]): Context =>
	({ session: { user: { permissions, email: 'staff@inreach.org' } } }) as unknown as Context

describe('Bulk Search & Replace permission gating', () => {
	// Every procedure this feature added - bulkSearchReplace.search, bulkSearchReplace.replaceText,
	// service.bulkAttachTags, service.bulkDetachTags, service.bulkAttachAttribute,
	// service.bulkDetachAttribute - is gated with this exact key. Testing the key once covers all six,
	// since they all delegate to the identical `permissionedProcedure('dataPortalManager')` call.
	const meta: Meta = { hasPerm: 'dataPortalManager' }

	it('rejects a dataPortalBasic-only session', () => {
		expect(checkPermissions(meta, makeCtx(['dataPortalBasic']))).toBe(false)
	})

	it('accepts a dataPortalManager session', () => {
		expect(checkPermissions(meta, makeCtx(['dataPortalManager']))).toBe(true)
	})

	it('accepts a dataPortalAdmin session (higher tier than required)', () => {
		expect(checkPermissions(meta, makeCtx(['dataPortalAdmin']))).toBe(true)
	})

	it('accepts a valid root session regardless of Data Portal tier', () => {
		expect(
			checkPermissions(meta, {
				session: { user: { permissions: ['root'], email: 'staff@inreach.org' } },
			} as unknown as Context)
		).toBe(true)
	})

	it('rejects a root-permission user without an @inreach.org email', () => {
		expect(
			checkPermissions(meta, {
				session: { user: { permissions: ['root'], email: 'someone@example.com' } },
			} as unknown as Context)
		).toBe(false)
	})
})

describe('The specific fallthrough bug this test file guards against', () => {
	it('demonstrates why attachServiceTags could NOT have been reused directly: its own permission key does not block dataPortalBasic', () => {
		// Confirms checkPermissions' documented "not on any blocklist -> Basic passes" fallthrough is
		// real, using attachServiceTags' actual gate as the example - NOT a claim that this is a bug in
		// attachServiceTags itself (dataPortalBasic can already edit services through the normal edit
		// page, so this is correct for that mutation). It's why bulkAttachTags/bulkDetachTags had to be
		// their own new procedures with their own dataPortalManager gate instead.
		const attachServiceTagsMeta: Meta = { hasPerm: ['editAnyOrg', 'createOrg'] }
		expect(checkPermissions(attachServiceTagsMeta, makeCtx(['dataPortalBasic']))).toBe(true)
	})
})

/**
 * Regression coverage for the Organizations data-portal table (`organization.forOrganizationTable`), which
 * used to be a `publicProcedure` - reachable with no session at all, and its response cacheable by the CDN
 * (only permissioned/staff/admin procedures call `markSkipCache`), which is also why staff saw stale data
 * after editing an org's status until a hard refresh. Gated behind `viewAllOrganizations` now, deliberately
 * mapped to `dataPortalBasic` (not `dataPortalManager`, like `viewAllUsers` is) - the Organizations page
 * itself already lets Basic-tier staff in, so the procedure-level gate has to match that same tier or it
 * would lock out staff who could load the page but not its data.
 */
describe('Organizations table permission gating (viewAllOrganizations)', () => {
	const meta: Meta = { hasPerm: 'dataPortalBasic' }

	it('rejects a session with no Data Portal role at all', () => {
		expect(checkPermissions(meta, makeCtx([]))).toBe(false)
	})

	it('accepts a dataPortalBasic session - this must NOT require Manager tier', () => {
		expect(checkPermissions(meta, makeCtx(['dataPortalBasic']))).toBe(true)
	})

	it('accepts dataPortalManager and dataPortalAdmin (higher tiers than required)', () => {
		expect(checkPermissions(meta, makeCtx(['dataPortalManager']))).toBe(true)
		expect(checkPermissions(meta, makeCtx(['dataPortalAdmin']))).toBe(true)
	})

	it('accepts a valid root session', () => {
		expect(
			checkPermissions(meta, {
				session: { user: { permissions: ['root'], email: 'staff@inreach.org' } },
			} as unknown as Context)
		).toBe(true)
	})
})

/**
 * #2107/#2114 - `checkPermissions`' root check, its `systemPerms` blocklist, and `checkStaffPermissions`' own
 * list all used to independently re-type the literal array `['root', 'sysadmin', 'system']` (plus a 4th copy
 * in `isAdmin`, identical logic to the first). Nothing caught a future edit to one copy missing the others.
 * `sysadmin`/`system` were never real `Permission` rows (confirmed below) and were deliberately dropped
 * rather than kept as permanent no-ops, so these now all build from the shared `ROOT_TIER_PERMISSIONS`
 * constant (`packages/db/lib/rootTierPermissions.ts`), currently just `['root']`. This guards two things:
 * that every call site still agrees with the shared constant (drift), and that `sysadmin`/`system`
 * specifically grant nothing (the #2114 decision, not just an absence of a positive test).
 */
describe('ROOT_TIER_PERMISSIONS (#2107/#2114)', () => {
	it.each(ROOT_TIER_PERMISSIONS)(
		'checkPermissions: %s + an inreach.org email bypasses every blocklist',
		(perm) => {
			const meta: Meta = { hasPerm: ['dataPortalAdmin', 'adminRoles'] }
			expect(
				checkPermissions(meta, {
					session: { user: { permissions: [perm], email: 'staff@inreach.org' } },
				} as unknown as Context)
			).toBe(true)
		}
	)

	it.each(ROOT_TIER_PERMISSIONS)(
		'checkStaffPermissions: %s alone is enough to enter the dashboard',
		(perm) => {
			expect(checkStaffPermissions([perm])).toBe(true)
		}
	)

	it('sysadmin and system grant nothing - dropped per #2114, not an oversight', () => {
		expect(checkStaffPermissions(['sysadmin'])).toBe(false)
		expect(checkStaffPermissions(['system'])).toBe(false)
		expect(
			checkPermissions({ hasPerm: ['dataPortalAdmin'] }, {
				session: { user: { permissions: ['sysadmin'], email: 'staff@inreach.org' } },
			} as unknown as Context)
		).toBe(false)
	})

	it('neither sysadmin nor system can currently be a real Permission value', () => {
		expect(realPermissions).not.toContain('sysadmin')
		expect(realPermissions).not.toContain('system')
	})
})
