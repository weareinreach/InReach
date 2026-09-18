import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: { orgPhone: { findMany: vi.fn() }, orgLocation: { count: vi.fn() } },
	isIdFor: (table: string, id: string) => id.startsWith(`${table}_`),
}))
vi.mock('~api/selects/global', () => ({
	globalWhere: { isPublic: () => ({ published: true, deleted: false }) },
}))

const { prisma } = await import('@weareinreach/db')
const { default: forContactInfo } = await import('./query.forContactInfo.handler')

const findManyMock = vi.mocked(prisma.orgPhone.findMany)
const locationCountMock = vi.mocked(prisma.orgLocation.count)

beforeEach(() => {
	findManyMock.mockReset()
	findManyMock.mockResolvedValue([])
	locationCountMock.mockReset()
	// Most existing tests below target parentId types (location, service) that never call this at all -
	// defaulting to "multi-location" (2) rather than "single" (1) means those tests fail loudly instead
	// of silently passing if the org-branch's location-count gating is ever accidentally triggered for them.
	locationCountMock.mockResolvedValue(2)
})

const lastCallArgs = () =>
	findManyMock.mock.calls.at(-1)?.[0] as { where: Record<string, unknown>; orderBy: unknown }

describe('orgPhone.forContactInfo - public visibility', () => {
	it('always applies the isPublic filter regardless of parent type', async () => {
		await forContactInfo({ input: { parentId: 'organization_test' } } as never)
		const { where } = lastCallArgs()
		expect(where).toMatchObject({ published: true, deleted: false })
	})

	it('filters to a specific organization', async () => {
		await forContactInfo({ input: { parentId: 'organization_test' } } as never)
		const { where } = lastCallArgs()
		expect(where.organization).toEqual({
			organization: { id: 'organization_test', published: true, deleted: false },
		})
	})

	it('filters to a specific location', async () => {
		await forContactInfo({ input: { parentId: 'orgLocation_test' } } as never)
		const { where } = lastCallArgs()
		expect(where.locations).toEqual({
			some: { location: { id: 'orgLocation_test', published: true, deleted: false } },
		})
	})

	it('filters to a specific service', async () => {
		await forContactInfo({ input: { parentId: 'orgService_test' } } as never)
		const { where } = lastCallArgs()
		expect(where.services).toEqual({
			some: { service: { id: 'orgService_test', published: true, deleted: false } },
		})
	})

	it('omits the locationOnly filter when not specified', async () => {
		await forContactInfo({ input: { parentId: 'organization_test' } } as never)
		const { where } = lastCallArgs()
		expect(where).not.toHaveProperty('locationOnly')
	})

	it('applies the locationOnly filter when explicitly true', async () => {
		await forContactInfo({ input: { parentId: 'organization_test', locationOnly: true } } as never)
		const { where } = lastCallArgs()
		expect(where.locationOnly).toBe(true)
	})

	it('applies the locationOnly filter when explicitly false', async () => {
		await forContactInfo({ input: { parentId: 'organization_test', locationOnly: false } } as never)
		const { where } = lastCallArgs()
		expect(where.locationOnly).toBe(false)
	})

	/**
	 * Unlike forContactInfoEdit (published desc, deleted asc), the public query only orders by primary desc -
	 * since isPublic already excludes unpublished/deleted rows. With no server-side exclusivity on `primary`
	 * (no unique constraint, no unset-others-on-set), two phones both marked primary for the same org have no
	 * defined secondary sort key here.
	 */
	it('orders by primary desc only', async () => {
		await forContactInfo({ input: { parentId: 'organization_test' } } as never)
		const { orderBy } = lastCallArgs()
		expect(orderBy).toEqual({ primary: 'desc' })
	})
})

describe('orgPhone.forContactInfo - location-linked numbers are excluded from a multi-location org page', () => {
	/**
	 * Reported issue: a phone listed on a location page also always showed up on the org's main page, with no
	 * way to unpublish it from just one - because the org-page query only ever checked "does this phone belong
	 * to the org" (true for every phone, since that relation is required), never "is this phone also scoped to
	 * one of the org's locations". Fixed by excluding phones that have a link to any public location, but only
	 * when the org actually has more than one - a single-location org has no separate public location page a
	 * visitor would ever reach, so it still shows everything.
	 */
	it('excludes phones linked to a public location when the org has more than one location', async () => {
		locationCountMock.mockResolvedValueOnce(2)
		await forContactInfo({ input: { parentId: 'organization_test' } } as never)
		const { where } = lastCallArgs()
		expect(where.locations).toEqual({ none: { location: { published: true, deleted: false } } })
	})

	it('does not exclude anything when the org has exactly one location', async () => {
		locationCountMock.mockResolvedValueOnce(1)
		await forContactInfo({ input: { parentId: 'organization_test' } } as never)
		const { where } = lastCallArgs()
		expect(where).not.toHaveProperty('locations')
	})

	/**
	 * Zero locations isn't "single location", so the exclusion clause is still applied - it's just a no-op in
	 * practice, since an org with no locations at all can't have any location-linked phones.
	 */
	it('still applies the (functionally inert) exclusion clause when the org has no locations at all', async () => {
		locationCountMock.mockResolvedValueOnce(0)
		await forContactInfo({ input: { parentId: 'organization_test' } } as never)
		const { where } = lastCallArgs()
		expect(where.locations).toEqual({ none: { location: { published: true, deleted: false } } })
	})

	it('counts only published, non-deleted locations toward the single-location check', async () => {
		await forContactInfo({ input: { parentId: 'organization_test' } } as never)
		expect(locationCountMock).toHaveBeenCalledWith({
			where: { organization: { id: 'organization_test' }, published: true, deleted: false },
		})
	})

	it('never runs the location count for a location-page or service-page request', async () => {
		await forContactInfo({ input: { parentId: 'orgLocation_test' } } as never)
		await forContactInfo({ input: { parentId: 'orgService_test' } } as never)
		expect(locationCountMock).not.toHaveBeenCalled()
	})
})

describe('orgPhone.forContactInfo - result shape', () => {
	it('maps a null description and phoneType to null', async () => {
		findManyMock.mockResolvedValueOnce([
			{
				id: 'orgPhone_test',
				number: '+15555550100',
				ext: null,
				country: { cca2: 'US' },
				primary: true,
				description: null,
				phoneType: null,
				locationOnly: false,
			},
		] as never)

		const result = await forContactInfo({ input: { parentId: 'organization_test' } } as never)

		expect(result[0]).toMatchObject({ description: null, phoneType: null, country: 'US' })
	})
})
