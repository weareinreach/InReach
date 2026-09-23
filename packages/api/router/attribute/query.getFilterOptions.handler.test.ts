import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: { attribute: { findMany: vi.fn() } },
}))

const { prisma } = await import('@weareinreach/db')
const { default: getFilterOptions } = await import('./query.getFilterOptions.handler')

const findManyMock = vi.mocked(prisma.attribute.findMany)

beforeEach(() => {
	findManyMock.mockReset()
})

describe('attribute.getFilterOptions', () => {
	it('3.4/3.5: requests only active attributes with a non-null filterType, sorted by tsKey', async () => {
		findManyMock.mockResolvedValueOnce([])

		await getFilterOptions()

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { AND: { filterType: { not: null }, active: true } },
				orderBy: { tsKey: 'asc' },
			})
		)
	})

	it('returns the DB result as-is - no post-processing/reshaping to verify', async () => {
		const rows = [{ id: 'attr_1', tsKey: 'attr.one', tsNs: 'attribute', filterType: 'CHECKBOX' }]
		findManyMock.mockResolvedValueOnce(rows as never)

		const result = await getFilterOptions()

		expect(result).toBe(rows)
	})
})
