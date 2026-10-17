import { beforeEach, describe, expect, it, vi } from 'vitest'

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
const { default: deleteItem } = await import('./mutation.deleteItem.handler')

const findListMock = vi.mocked(prisma.userSavedList.findUniqueOrThrow)
const updateMock = vi.fn()
const getAuditedClientMock = vi.mocked(getAuditedClient)

const ORG_ID = 'orgn_01ARZ3NDEKTSV4RRFFQ69G5FAV'

beforeEach(() => {
	findListMock.mockReset()
	updateMock.mockReset()
	getAuditedClientMock.mockReset().mockReturnValue({ userSavedList: { update: updateMock } } as never)
})

const ctx = { session: { user: { id: 'user_owner' } }, actorId: 'user_owner' }

describe('savedLists.deleteItem', () => {
	it('removes the organization relation for the given item', async () => {
		findListMock.mockResolvedValueOnce({ id: 'list_1', ownedById: 'user_owner' } as never)
		updateMock.mockResolvedValueOnce({ id: 'list_1', organizations: [], services: [] })

		await deleteItem({ ctx, input: { id: 'list_1', itemId: ORG_ID } } as never)

		expect(updateMock).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					organizations: { delete: { listId_organizationId: { listId: 'list_1', organizationId: ORG_ID } } },
				}),
			})
		)
	})

	/**
	 * `checkListOwnership(...)` is now properly awaited (previously fire-and-forget, same bug class as #2074).
	 * Not exploitable here specifically even before the fix, since `update()`'s own where clause independently
	 * requires `ownedById` to match - but now the real check is what rejects a non-owner's delete, and
	 * `update()` is never even called.
	 */
	it("7.7: a non-owner's delete is rejected by checkListOwnership before update() ever runs", async () => {
		findListMock.mockResolvedValueOnce({ id: 'list_1', ownedById: 'someone-else' } as never)

		await expect(deleteItem({ ctx, input: { id: 'list_1', itemId: ORG_ID } } as never)).rejects.toMatchObject(
			{ code: 'UNAUTHORIZED' }
		)
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
			deleteItem({ ctx, input: { id: 'list_missing', itemId: ORG_ID } } as never)
		).rejects.toMatchObject({ code: 'NOT_FOUND' })
	})
})
