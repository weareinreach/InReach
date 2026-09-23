import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({ getAuditedClient: vi.fn() }))

const { getAuditedClient } = await import('@weareinreach/db')
const { default: create } = await import('./mutation.create.handler')

const createMock = vi.fn()
const getAuditedClientMock = vi.mocked(getAuditedClient)

beforeEach(() => {
	createMock.mockReset()
	getAuditedClientMock.mockReset().mockReturnValue({ userSavedList: { create: createMock } } as never)
})

describe('savedLists.create', () => {
	it('creates a list owned by the calling user, not an arbitrary/spoofable id', async () => {
		const ctx = { session: { user: { id: 'user_1' } }, actorId: 'user_1' }
		createMock.mockResolvedValueOnce({ id: 'list_1', name: 'My List' })

		await create({ ctx, input: { name: 'My List' } } as never)

		expect(createMock).toHaveBeenCalledWith(
			expect.objectContaining({ data: { name: 'My List', ownedById: 'user_1' } })
		)
	})
})
