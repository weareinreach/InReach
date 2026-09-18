import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: { orgPhone: { findMany: vi.fn() } },
	isIdFor: (table: string, id: string) => id.startsWith(`${table}_`),
}))
vi.mock('~api/selects/global', () => ({
	globalWhere: { isPublic: () => ({ published: true, deleted: false }) },
}))

const { prisma } = await import('@weareinreach/db')
const { default: forContactInfo } = await import('./query.forContactInfo.handler')

const findManyMock = vi.mocked(prisma.orgPhone.findMany)

beforeEach(() => {
	findManyMock.mockReset()
	findManyMock.mockResolvedValue([])
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
