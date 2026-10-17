import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', async (importOriginal) => {
	const actual = await importOriginal()
	return { ...(actual as object), getAuditedClient: vi.fn() }
})

const { getAuditedClient } = await import('@weareinreach/db')
const { default: createAndSaveItem } = await import('./mutation.createAndSaveItem.handler')

const createMock = vi.fn()
const getAuditedClientMock = vi.mocked(getAuditedClient)

const ORG_ID = 'orgn_01ARZ3NDEKTSV4RRFFQ69G5FAV'
const SERVICE_ID = 'osvc_01ARZ3NDEKTSV4RRFFQ69G5FAV'

beforeEach(() => {
	createMock.mockReset()
	getAuditedClientMock.mockReset().mockReturnValue({ userSavedList: { create: createMock } } as never)
})

const ctx = { session: { user: { id: 'user_1' } }, actorId: 'user_1' }

describe('savedLists.createAndSaveItem', () => {
	it('7.6a: creates a new list owned by the caller and saves an organization into it in one operation', async () => {
		createMock.mockResolvedValueOnce({
			id: 'list_1',
			organizations: [{ organizationId: ORG_ID }],
			services: [],
		})

		await createAndSaveItem({ ctx, input: { name: 'New List', itemId: ORG_ID } } as never)

		expect(createMock).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					name: 'New List',
					ownedById: 'user_1',
					organizations: { create: { organizationId: ORG_ID } },
				}),
			})
		)
	})

	it('7.6b: a service id saves into `services`, not `organizations`', async () => {
		createMock.mockResolvedValueOnce({
			id: 'list_1',
			organizations: [],
			services: [{ serviceId: SERVICE_ID }],
		})

		await createAndSaveItem({ ctx, input: { name: 'New List', itemId: SERVICE_ID } } as never)

		expect(createMock).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ services: { create: { serviceId: SERVICE_ID } } }),
			})
		)
	})
})
