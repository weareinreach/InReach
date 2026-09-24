import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: { serviceCategory: { findMany: vi.fn() } },
}))

const { prisma } = await import('@weareinreach/db')
const { default: getFilterOptions } = await import('./query.getFilterOptions.handler')

const findManyMock = vi.mocked(prisma.serviceCategory.findMany)

beforeEach(() => {
	findManyMock.mockReset()
})

describe('service.getFilterOptions', () => {
	/**
	 * The DB is mocked, so these can't prove real Postgres filtering/sorting - what they prove is that the
	 * query this handler sends to Prisma still asks for the right thing. A regression that drops one of these
	 * conditions from the `where`/`orderBy` (e.g. during a refactor) fails here even though a shallow "does it
	 * return something" test wouldn't catch it.
	 */
	it('3.1/3.2: requests only active, non-crisis-only categories with active nested services/tags', async () => {
		findManyMock.mockResolvedValueOnce([])

		await getFilterOptions()

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					active: true,
					OR: [{ crisisSupportOnly: null }, { crisisSupportOnly: false }],
				},
				select: expect.objectContaining({
					services: expect.objectContaining({
						where: { active: true, serviceTag: { active: true } },
					}),
				}),
			})
		)
	})

	it('3.3: requests nested services sorted by tag name ascending', async () => {
		findManyMock.mockResolvedValueOnce([])

		await getFilterOptions()

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				select: expect.objectContaining({
					services: expect.objectContaining({ orderBy: { serviceTag: { name: 'asc' } } }),
				}),
			})
		)
	})

	it("flattens each category's nested `{ serviceTag }` wrapper into a plain `services` array of tags", async () => {
		findManyMock.mockResolvedValueOnce([
			{
				id: 'svct_1',
				tsKey: 'category.one',
				tsNs: 'services',
				services: [
					{ serviceTag: { id: 'svtg_1', tsKey: 'tag.one', tsNs: 'services' } },
					{ serviceTag: { id: 'svtg_2', tsKey: 'tag.two', tsNs: 'services' } },
				],
			},
		] as never)

		const result = await getFilterOptions()

		expect(result).toEqual([
			{
				id: 'svct_1',
				tsKey: 'category.one',
				tsNs: 'services',
				services: [
					{ id: 'svtg_1', tsKey: 'tag.one', tsNs: 'services' },
					{ id: 'svtg_2', tsKey: 'tag.two', tsNs: 'services' },
				],
			},
		])
	})
})
