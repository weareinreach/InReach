import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: { userSavedList: { findMany: vi.fn() } },
}))

const { prisma } = await import('@weareinreach/db')
const { default: isSaved } = await import('./query.isSaved.handler')

const findManyMock = vi.mocked(prisma.userSavedList.findMany)

beforeEach(() => {
	findManyMock.mockReset()
})

describe('savedList.isSaved', () => {
	it('7.1: returns false without querying the DB when the caller is logged out', async () => {
		const ctx = { session: null }

		const result = await isSaved({ ctx, input: 'orgn_01ARZ3NDEKTSV4RRFFQ69G5FAV' } as never)

		expect(result).toBe(false)
		expect(findManyMock).not.toHaveBeenCalled()
	})

	it('7.2: returns the matching list(s) when the item is saved somewhere', async () => {
		const ctx = { session: { user: { id: 'user_1' } } }
		findManyMock.mockResolvedValueOnce([{ id: 'list_1', name: 'Favorites' }] as never)

		const result = await isSaved({ ctx, input: 'orgn_01ARZ3NDEKTSV4RRFFQ69G5FAV' } as never)

		expect(result).toEqual([{ id: 'list_1', name: 'Favorites' }])
	})

	it('7.3: returns null (not false, not an empty array) when the item is not saved anywhere', async () => {
		const ctx = { session: { user: { id: 'user_1' } } }
		findManyMock.mockResolvedValueOnce([])

		const result = await isSaved({ ctx, input: 'orgn_01ARZ3NDEKTSV4RRFFQ69G5FAV' } as never)

		expect(result).toBeNull()
	})
})
