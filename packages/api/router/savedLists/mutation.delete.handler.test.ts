import { beforeEach, describe, expect, it, vi } from 'vitest'

// Left real (unmocked) - this handler is the reference-correct pattern in this router (it DOES
// `await checkListOwnership(...)`), and proving that matters more here than isolating it.
vi.mock('@weareinreach/db', () => ({
	prisma: { userSavedList: { findUniqueOrThrow: vi.fn() } },
	getAuditedClient: vi.fn(),
}))

const { prisma, getAuditedClient } = await import('@weareinreach/db')
const { default: deleteList } = await import('./mutation.delete.handler')

const findListMock = vi.mocked(prisma.userSavedList.findUniqueOrThrow)
const deleteMock = vi.fn()
const getAuditedClientMock = vi.mocked(getAuditedClient)

beforeEach(() => {
	findListMock.mockReset()
	deleteMock.mockReset()
	getAuditedClientMock.mockReset().mockReturnValue({ userSavedList: { delete: deleteMock } } as never)
})

const ctx = { session: { user: { id: 'user_owner' } }, actorId: 'user_owner' }

describe('savedLists.delete', () => {
	it('deletes a list the caller owns', async () => {
		findListMock.mockResolvedValueOnce({ id: 'list_1', ownedById: 'user_owner' } as never)
		deleteMock.mockResolvedValueOnce({ id: 'list_1', name: 'My List' })

		const result = await deleteList({ ctx, input: { id: 'list_1' } } as never)

		expect(result).toEqual({ id: 'list_1', name: 'My List' })
	})

	/**
	 * Contrast case for #2074: this handler correctly `await`s checkListOwnership before proceeding (unlike
	 * shareUrl/unShareUrl), and its own `delete()` has no ownedById filter of its own to fall back on - so this
	 * one relies entirely on the awaited check, and that's sufficient here because it IS awaited. Confirms the
	 * fix recommended in #2074 (just adding `await`) is a complete fix, not a partial one - this is what "done
	 * correctly" looks like elsewhere in the same file.
	 */
	it("rejects a non-owner's delete before the delete() call ever runs", async () => {
		findListMock.mockResolvedValueOnce({ id: 'list_1', ownedById: 'someone-else' } as never)

		await expect(deleteList({ ctx, input: { id: 'list_1' } } as never)).rejects.toThrow()
		expect(deleteMock).not.toHaveBeenCalled()
	})
})
