import { describe, expect, it } from 'vitest'

import { type Context } from '../context'
import { type Meta } from '../initTRPC'
import { checkPermissions } from './permissions'

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
