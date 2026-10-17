import { beforeEach, describe, expect, it, vi } from 'vitest'

// `isIdFor` is left real (unmocked) - it's a pure prefix/ULID-shape check, no DB needed, and using the
// real implementation is what actually proves the org-vs-service branch selection works for real ids.
vi.mock('@weareinreach/db', async (importOriginal) => {
	const actual = await importOriginal()
	return {
		...(actual as object),
		prisma: { userSavedList: { findUniqueOrThrow: vi.fn() } },
		getAuditedClient: vi.fn(),
		// errorHandler.ts checks `error instanceof Prisma.PrismaClientKnownRequestError` - needs a real
		// class here (not just `{}`) or that check throws a TypeError instead of returning false.
		Prisma: { PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {} },
	}
})

const { prisma, getAuditedClient, Prisma } = await import('@weareinreach/db')
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
	 * `checkListOwnership(...)` is now properly awaited (previously fire-and-forget, same bug class as #2074's
	 * shareUrl/unShareUrl - never exploitable here specifically, since `update()`'s own where clause
	 * independently requires `ownedById` to match, but still worth the `await` so the real, intentional check
	 * is what rejects a non-owner's save, not an incidental Prisma "not found"). Confirms `update()` is never
	 * even called once ownership fails - the check now short-circuits first.
	 */
	it("7.4c: a non-owner's save is rejected by checkListOwnership before update() ever runs", async () => {
		findListMock.mockResolvedValueOnce({ id: 'list_1', ownedById: 'someone-else' } as never)

		await expect(saveItem({ ctx, input: { id: 'list_1', itemId: ORG_ID } } as never)).rejects.toMatchObject({
			code: 'UNAUTHORIZED',
		})
		expect(updateMock).not.toHaveBeenCalled()
	})

	/** A list id that doesn't exist at all surfaces as a clean NOT_FOUND, not a raw Prisma error. */
	it('a list id that does not exist surfaces as NOT_FOUND, not a raw Prisma error', async () => {
		const notFoundError = new Prisma.PrismaClientKnownRequestError(
			'An operation failed because it depends on one or more records that were required but not found.',
			{ code: 'P2025', clientVersion: 'test' }
		)
		;(notFoundError as unknown as { code: string }).code = 'P2025'
		findListMock.mockRejectedValueOnce(notFoundError)

		await expect(
			saveItem({ ctx, input: { id: 'list_missing', itemId: ORG_ID } } as never)
		).rejects.toMatchObject({ code: 'NOT_FOUND' })
	})
})
