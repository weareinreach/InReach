import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: {
		orgLocation: { count: vi.fn() },
		orgPhone: { findMany: vi.fn() },
	},
	// The real isIdFor also validates a canonical ULID suffix - not needed here, since these tests
	// only exercise getWhereId's branch selection by entity type, using plain `<table>_test` ids.
	isIdFor: (table: string, id: string) => id.startsWith(`${table}_`),
}))

const { prisma } = await import('@weareinreach/db')
const { default: forContactInfoEdit } = await import('./query.forContactInfoEdit.handler')

const countMock = vi.mocked(prisma.orgLocation.count)
const findManyMock = vi.mocked(prisma.orgPhone.findMany)

// `count` is only ever called for an organization parentId (see getWhereId) - several tests below
// use a location/service parentId and never consume their queued mockResolvedValueOnce, which would
// otherwise leak into whichever later test's count() call comes next.
beforeEach(() => {
	countMock.mockReset()
	findManyMock.mockReset()
})

const runWhere = async (parentId: string, locationCount = 0) => {
	countMock.mockResolvedValueOnce(locationCount)
	findManyMock.mockResolvedValueOnce([])
	await forContactInfoEdit({ input: { parentId } } as never)
	return findManyMock.mock.calls.at(-1)?.[0] as { where: unknown; orderBy: unknown }
}

describe('orgPhone.forContactInfoEdit - visibility by parent type and location count', () => {
	/**
	 * The organization's edit page lists only the organization's own phones, however many locations it has.
	 * Phones marked location-only (including ones added from a location, which are still stored under the org)
	 * are edited on their location's page. This replaced a rule that also pulled a single-location org's
	 * location phones into its org edit view, so staff couldn't tell where a phone came from.
	 */
	it.each([0, 1, 2])(
		'an org with %i location(s) sees only its own phones, never location-only ones',
		async (locationCount) => {
			const { where } = await runWhere('organization_test', locationCount)
			expect(where).toEqual({
				organization: { organization: { id: 'organization_test' } },
				locationOnly: false,
			})
		}
	)

	it("a location parentId only sees that location's phones", async () => {
		const { where } = await runWhere('orgLocation_test')
		expect(where).toEqual({ locations: { some: { location: { id: 'orgLocation_test' } } } })
	})

	it("a service parentId only sees that service's phones", async () => {
		const { where } = await runWhere('orgService_test')
		expect(where).toEqual({ services: { some: { service: { id: 'orgService_test' } } } })
	})

	it('orders by published desc then deleted asc', async () => {
		const { orderBy } = await runWhere('organization_test', 0)
		expect(orderBy).toEqual([{ published: 'desc' }, { deleted: 'asc' }])
	})
})

describe('orgPhone.forContactInfoEdit - result shape', () => {
	it('maps a null description and phoneType to null rather than an empty object', async () => {
		countMock.mockResolvedValueOnce(0)
		findManyMock.mockResolvedValueOnce([
			{
				id: 'orgPhone_test',
				number: '+15555550100',
				ext: null,
				country: { cca2: 'US' },
				primary: false,
				description: null,
				phoneType: null,
				locationOnly: false,
				published: true,
				deleted: false,
			},
		] as never)

		const result = await forContactInfoEdit({ input: { parentId: 'organization_test' } } as never)

		expect(result[0]).toMatchObject({ description: null, phoneType: null, country: 'US' })
	})

	it("flags the organization's phones on a location page (linkedFromOrg), never the location's own", async () => {
		const row = { id: 'orgPhone_test', number: '+15555550100', ext: null, country: { cca2: 'US' } }
		findManyMock.mockResolvedValueOnce([
			{ ...row, id: 'orgPhone_org', locationOnly: false },
			{ ...row, id: 'orgPhone_loc', locationOnly: true },
		] as never)

		const onLocation = await forContactInfoEdit({ input: { parentId: 'orgLocation_test' } } as never)
		expect(onLocation.map(({ id, linkedFromOrg }) => [id, linkedFromOrg])).toEqual([
			['orgPhone_org', true],
			['orgPhone_loc', false],
		])

		findManyMock.mockResolvedValueOnce([{ ...row, locationOnly: false }] as never)
		const onOrg = await forContactInfoEdit({ input: { parentId: 'organization_test' } } as never)
		expect(onOrg[0]?.linkedFromOrg).toBe(false)
	})
})
