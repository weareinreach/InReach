import { beforeEach, describe, expect, it, vi } from 'vitest'

// `searchOrgByRelevance` (the raw-SQL matcher) and `prismaDistSearchDetails` (the Prisma reshaping
// step) both live unexported inside query.searchDistanceV3.handler.ts - only the default export is
// testable directly. Mocking `$queryRaw` and `organization.findMany` still isolates what's meaningfully
// testable without a live DB: the post-query formatting/reshaping/stitching logic, not the raw SQL's
// own matching/ranking (see docs/Testing/search-api-test-inventory.md §1's "Vitest (real local DB)"
// cases for that half).
vi.mock('@weareinreach/db', async (importOriginal) => {
	const actual = await importOriginal()
	return {
		...(actual as object),
		prisma: { $queryRaw: vi.fn(), organization: { findMany: vi.fn() } },
	}
})

const { prisma } = await import('@weareinreach/db')
const { default: searchDistanceV3 } = await import('./query.searchDistanceV3.handler')

const queryRawMock = vi.mocked(prisma.$queryRaw)
const findManyMock = vi.mocked(prisma.organization.findMany)

const baseInput = {
	lat: 40.7128,
	lon: -74.006,
	dist: 50,
	unit: 'mi' as const,
	skip: 0,
	take: 25,
	version: 'v3' as const,
	focuses: [],
	sortBias: 'DISTANCE' as const,
}

beforeEach(() => {
	queryRawMock.mockReset()
	findManyMock.mockReset()
})

describe('organization.searchDistance (v3)', () => {
	it('1.11: a national/remote match with no computable distance stays null in the final result, not 0 or NaN', async () => {
		queryRawMock.mockResolvedValueOnce([
			{
				id: 'orgn_1',
				distance: null,
				isLocal: false,
				tier: 'NATIONAL',
				total: '1',
				relevance_score: 0,
				slug: 'remote-org',
				matchedAttributes: [],
				matchedServices: [],
				national: ['US'],
			},
		] as never)
		findManyMock.mockResolvedValueOnce([
			{
				id: 'orgn_1',
				slug: 'remote-org',
				name: 'Remote Org',
				attributes: [],
				description: null,
				locations: [],
				services: [],
			},
		] as never)

		const result = await searchDistanceV3({ input: baseInput } as never)

		expect(result.orgs).toHaveLength(1)
		expect(result.orgs[0]?.distance).toBeNull()
		expect(result.orgs[0]?.national).toEqual(['US'])
	})

	it('1.13: a location marked addressVisibility HIDDEN is excluded from the returned city list, even when other locations are public', async () => {
		queryRawMock.mockResolvedValueOnce([
			{
				id: 'orgn_1',
				distance: '5000',
				isLocal: true,
				tier: 'NEIGHBORHOOD',
				total: '1',
				relevance_score: 1,
				slug: 'test-org',
				matchedAttributes: [],
				matchedServices: [],
				national: null,
			},
		] as never)
		findManyMock.mockResolvedValueOnce([
			{
				id: 'orgn_1',
				slug: 'test-org',
				name: 'Test Org',
				attributes: [],
				description: null,
				locations: [
					{
						city: 'Hidden City',
						addressVisibility: 'HIDDEN',
						latitude: 40.71,
						longitude: -74.0,
						services: [],
					},
					{
						city: 'Public City',
						addressVisibility: 'PUBLIC',
						latitude: 40.72,
						longitude: -74.01,
						services: [],
					},
				],
				services: [],
			},
		] as never)

		const result = await searchDistanceV3({ input: baseInput } as never)

		expect(result.orgs[0]?.locations).toEqual(['Public City'])
		expect(result.orgs[0]?.locations).not.toContain('Hidden City')
	})

	it("preserves the raw-query relevance ordering when stitching in the reshaped detail data, not the detail query's own (unordered) return order", async () => {
		queryRawMock.mockResolvedValueOnce([
			{
				id: 'orgn_2',
				distance: '10000',
				isLocal: true,
				tier: 'LOCAL',
				total: '2',
				relevance_score: 2,
				slug: 'second',
				matchedAttributes: [],
				matchedServices: [],
				national: null,
			},
			{
				id: 'orgn_1',
				distance: '5000',
				isLocal: true,
				tier: 'NEIGHBORHOOD',
				total: '2',
				relevance_score: 5,
				slug: 'first',
				matchedAttributes: [],
				matchedServices: [],
				national: null,
			},
		] as never)
		// Detail query returns them in a different (e.g. id-ascending) order - the handler must reorder
		// to match the raw query's own relevance/distance ordering, not just pass this through.
		findManyMock.mockResolvedValueOnce([
			{
				id: 'orgn_1',
				slug: 'first',
				name: 'First',
				attributes: [],
				description: null,
				locations: [],
				services: [],
			},
			{
				id: 'orgn_2',
				slug: 'second',
				name: 'Second',
				attributes: [],
				description: null,
				locations: [],
				services: [],
			},
		] as never)

		const result = await searchDistanceV3({ input: baseInput } as never)

		expect(result.orgs.map((org) => org.id)).toEqual(['orgn_2', 'orgn_1'])
	})

	it('1.9/2.5: sortBias RELEVANCE vs DISTANCE with identical inputs otherwise produces the same $queryRaw call - the dead-parameter finding from relevanceScore.test.ts, confirmed here at the full-handler level too', async () => {
		queryRawMock.mockResolvedValue([] as never)
		findManyMock.mockResolvedValue([] as never)

		await searchDistanceV3({ input: { ...baseInput, sortBias: 'DISTANCE' } } as never)
		await searchDistanceV3({ input: { ...baseInput, sortBias: 'RELEVANCE' } } as never)

		const [distanceCallArgs] = queryRawMock.mock.calls[0] as [TemplateStringsArray, ...unknown[]]
		const [relevanceCallArgs] = queryRawMock.mock.calls[1] as [TemplateStringsArray, ...unknown[]]
		expect(queryRawMock.mock.calls[0]).toEqual(queryRawMock.mock.calls[1])
		expect(distanceCallArgs).toBe(relevanceCallArgs) // same tagged-template strings array either way
	})
})
