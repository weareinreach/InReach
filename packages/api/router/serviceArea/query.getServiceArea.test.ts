import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({ prisma: { serviceArea: { findUnique: vi.fn() } } }))

const { prisma } = await import('@weareinreach/db')
const { default: getServiceArea } = await import('./query.getServiceArea.handler')

const findUniqueMock = vi.mocked(prisma.serviceArea.findUnique)

/**
 * Public endpoint - a service area tied to a hidden org/location/service must not resolve, or this reveals
 * that a hidden org/location/service exists by still returning its coverage data.
 */
describe('serviceArea.getServiceArea - only resolves for a visible org/location/service', () => {
	it('requires active: true and a published/non-deleted org, location, or service in the where clause', async () => {
		findUniqueMock.mockResolvedValue(null)

		await getServiceArea({ input: 'svca_test' } as never)

		expect(findUniqueMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					id: 'svca_test',
					active: true,
					OR: expect.arrayContaining([
						{ organization: { is: { published: true, deleted: false } } },
						{
							orgLocation: {
								is: { published: true, deleted: false, organization: { published: true, deleted: false } },
							},
						},
						{
							orgService: {
								is: { published: true, deleted: false, organization: { published: true, deleted: false } },
							},
						},
					]),
				}),
			})
		)
	})
})
