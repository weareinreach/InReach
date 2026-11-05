import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', async (importOriginal) => {
	const actual = await importOriginal()
	return { ...(actual as object), prisma: { orgLocation: { findFirst: vi.fn() } } }
})

const { prisma } = await import('@weareinreach/db')
const { default: getTz } = await import('./query.getTz.handler')

const findFirstMock = vi.mocked(prisma.orgLocation.findFirst)

/**
 * Public endpoint - previously worked identically for a hidden location (or a location under a hidden
 * org/service) as a visible one, which could reveal that a hidden location exists at all.
 */
describe('orgHours.getTz - excludes hidden orgs/locations/services', () => {
	it('filters directly by a location id to a published, non-deleted location', async () => {
		findFirstMock.mockResolvedValue(null)

		await expect(getTz({ input: 'oloc_01ARZ3NDEKTSV4RRFFQ69G5FAV' } as never)).rejects.toMatchObject({
			code: 'NOT_FOUND',
		})

		expect(findFirstMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id: 'oloc_01ARZ3NDEKTSV4RRFFQ69G5FAV', published: true, deleted: false },
			})
		)
	})

	it('filters by organization id through a published, non-deleted org', async () => {
		findFirstMock.mockResolvedValue(null)

		await expect(getTz({ input: 'orgn_01ARZ3NDEKTSV4RRFFQ69G5FAV' } as never)).rejects.toMatchObject({
			code: 'NOT_FOUND',
		})

		expect(findFirstMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					organization: { id: 'orgn_01ARZ3NDEKTSV4RRFFQ69G5FAV', published: true, deleted: false },
					published: true,
					deleted: false,
				},
			})
		)
	})

	it('filters by service id through a published, non-deleted service', async () => {
		findFirstMock.mockResolvedValue(null)

		await expect(getTz({ input: 'osvc_01ARZ3NDEKTSV4RRFFQ69G5FAV' } as never)).rejects.toMatchObject({
			code: 'NOT_FOUND',
		})

		expect(findFirstMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					services: {
						some: {
							serviceId: 'osvc_01ARZ3NDEKTSV4RRFFQ69G5FAV',
							service: { published: true, deleted: false },
						},
					},
					published: true,
					deleted: false,
				},
			})
		)
	})
})
