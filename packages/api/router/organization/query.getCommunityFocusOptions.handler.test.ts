import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: { attribute: { findMany: vi.fn() } },
}))

const { prisma } = await import('@weareinreach/db')
const { default: getCommunityFocusOptions } = await import('./query.getCommunityFocusOptions.handler')

const findManyMock = vi.mocked(prisma.attribute.findMany)

beforeEach(() => {
	findManyMock.mockReset()
})

describe('organization.getCommunityFocusOptions', () => {
	it('3.6/3.7: requests only active, top-level (no parent) service-focus attributes, sorted by tsKey', async () => {
		findManyMock.mockResolvedValueOnce([])

		await getCommunityFocusOptions()

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					categories: { some: { category: { tag: 'service-focus' } } },
					parents: { none: {} },
					active: true,
				},
				orderBy: { tsKey: 'asc' },
			})
		)
	})

	it('returns the DB result as-is', async () => {
		const rows = [{ id: 'attr_1', tag: 'focus-a', tsNs: 'attribute', tsKey: 'focus.a', icon: null }]
		findManyMock.mockResolvedValueOnce(rows as never)

		const result = await getCommunityFocusOptions()

		expect(result).toBe(rows)
	})
})
