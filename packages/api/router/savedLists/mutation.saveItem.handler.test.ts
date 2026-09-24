import { beforeEach, describe, expect, it, vi } from 'vitest'

import { swallowListOwnershipRejection } from '~api/test/swallowListOwnershipRejection'

swallowListOwnershipRejection()

// `isIdFor` is left real (unmocked) - it's a pure prefix/ULID-shape check, no DB needed, and using the
// real implementation is what actually proves the org-vs-service branch selection works for real ids.
vi.mock('@weareinreach/db', async (importOriginal) => {
	const actual = await importOriginal()
	return {
		...(actual as object),
		prisma: { userSavedList: { findUniqueOrThrow: vi.fn() } },
		getAuditedClient: vi.fn(),
	}
})

const { prisma, getAuditedClient } = await import('@weareinreach/db')
const { default: saveItem } = await import('./mutation.saveItem.handler')

const findListMock = vi.mocked(prisma.userSavedList.findUniqueOrThrow)
const updateMock = vi.fn()
const getAuditedClientMock = vi.mocked(getAuditedClient)

const ORG_ID = 'orgn_01ARZ3NDEKTSV4RRFFQ69G5FAV'
const SERVICE_ID = 'osvc_01ARZ3NDEKTSV4RRFFQ69G5FAV'

beforeEach(() => {
	findListMock.mockReset()
	updateMock.mockReset()
	getAuditedClientMock.mockReset().mockReturnValue({ userSavedList: { update: updateMock } } as never)
})

const ctx = { session: { user: { id: 'user_owner' } }, actorId: 'user_owner' }

describe('savedLists.saveItem', () => {
	it('7.4a: an organization id creates an `organizations` relation, not `services`', async () => {
		findListMock.mockResolvedValueOnce({ id: 'list_1', ownedById: 'user_owner' } as never)
		updateMock.mockResolvedValueOnce({
			id: 'list_1',
			organizations: [{ organizationId: ORG_ID }],
			services: [],
		})

		await saveItem({ ctx, input: { id: 'list_1', itemId: ORG_ID } } as never)

		expect(updateMock).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ organizations: { create: { organizationId: ORG_ID } } }),
			})
		)
	})

	it('7.4b: a service id creates a `services` relation, not `organizations`', async () => {
		findListMock.mockResolvedValueOnce({ id: 'list_1', ownedById: 'user_owner' } as never)
		updateMock.mockResolvedValueOnce({
			id: 'list_1',
			organizations: [],
			services: [{ serviceId: SERVICE_ID }],
		})

		await saveItem({ ctx, input: { id: 'list_1', itemId: SERVICE_ID } } as never)

		expect(updateMock).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ services: { create: { serviceId: SERVICE_ID } } }),
			})
		)
	})

	/**
	 * NOT exploitable the same way as shareUrl/unShareUrl (#2074), despite the identical unawaited
	 * `checkListOwnership(...)` call - confirmed here rather than assumed, because this handler's own
	 * `update()` where clause independently includes `ownedById: ctx.session.user.id`. Prisma's `update` throws
	 * (record-to-update-not-found) when a non-unique extra where condition doesn't match, so a non-owner's save
	 * attempt is rejected by the query itself - the unawaited ownership check is redundant/dead here, not a
	 * live hole. Still worth the `await` for consistency and to avoid an unhandled rejection on every
	 * legitimate-looking-but-wrong-owner attempt.
	 */
	it("7.4c: a non-owner's save is still rejected, because update()'s own where clause requires ownedById to match", async () => {
		findListMock.mockResolvedValueOnce({ id: 'list_1', ownedById: 'someone-else' } as never)
		updateMock.mockRejectedValueOnce(
			new Error(
				'An operation failed because it depends on one or more records that were required but not found. Record to update not found.'
			)
		)

		await expect(saveItem({ ctx, input: { id: 'list_1', itemId: ORG_ID } } as never)).rejects.toThrow()
		expect(updateMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: 'list_1', ownedById: 'user_owner' } })
		)
	})
})
