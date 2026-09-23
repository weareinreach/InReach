import { beforeEach, describe, expect, it, vi } from 'vitest'

import { swallowListOwnershipRejection } from '~api/test/swallowListOwnershipRejection'

swallowListOwnershipRejection()

vi.mock('@weareinreach/db', async (importOriginal) => {
	const actual = await importOriginal()
	return {
		...(actual as object),
		prisma: { userSavedList: { findUniqueOrThrow: vi.fn() } },
		getAuditedClient: vi.fn(),
	}
})

const { prisma, getAuditedClient } = await import('@weareinreach/db')
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

	/** Same redundant-but-safe pattern confirmed for saveItem in mutation.saveItem.handler.test.ts's 7.4c. */
	it("7.7: a non-owner's delete is still rejected via update()'s own ownedById where clause", async () => {
		findListMock.mockResolvedValueOnce({ id: 'list_1', ownedById: 'someone-else' } as never)
		updateMock.mockRejectedValueOnce(new Error('Record to update not found.'))

		await expect(deleteItem({ ctx, input: { id: 'list_1', itemId: ORG_ID } } as never)).rejects.toThrow()
		expect(updateMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: 'list_1', ownedById: 'user_owner' } })
		)
	})
})
