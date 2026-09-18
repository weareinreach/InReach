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
	it('an org with zero locations only sees organization-level phones', async () => {
		const { where } = await runWhere('organization_test', 0)
		expect(where).toEqual({ organization: { organization: { id: 'organization_test' } } })
	})

	/**
	 * Non-obvious branch (query.forContactInfoEdit.handler.ts:7-17): when an org has exactly one location, its
	 * org-wide edit view also pulls in that single location's phones via an OR clause - a two-location org does
	 * not get this treatment. Easy to miss without varying location count.
	 */
	it("an org with exactly one location also includes that location's phones (isSingleLoc)", async () => {
		const { where } = await runWhere('organization_test', 1)
		expect(where).toEqual({
			OR: [
				{ organization: { organization: { id: 'organization_test' } } },
				{ locations: { some: { location: { organization: { id: 'organization_test' } } } } },
			],
		})
	})

	it('an org with two or more locations excludes location-tied phones from the org-wide view', async () => {
		const { where } = await runWhere('organization_test', 2)
		expect(where).toEqual({ organization: { organization: { id: 'organization_test' } } })
	})

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
})
