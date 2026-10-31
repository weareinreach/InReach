import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', async (importOriginal) => {
	const actual = await importOriginal()
	return { ...(actual as object), prisma: { orgLocation: { findUniqueOrThrow: vi.fn() } } }
})

const { prisma } = await import('@weareinreach/db')
const { default: forLocationPage } = await import('./query.forLocationPage.handler')

const findMock = vi.mocked(prisma.orgLocation.findUniqueOrThrow)

const location = {
	id: 'oloc_test',
	primary: true,
	name: 'Main Office',
	street1: '123 Main St',
	street2: null,
	city: 'Springfield',
	postCode: '12345',
	country: { cca2: 'US' },
	govDist: { abbrev: 'IL', tsKey: 'gov.il', tsNs: 'gov-dist' },
	longitude: -75.2,
	latitude: 40.1,
	description: null,
	addressVisibility: 'FULL',
	reviews: [],
	attributes: [],
}

/**
 * Regression for the IDOR where /org/<any-slug>/<any-location-id> rendered a location's real data regardless
 * of whether it actually belonged to the organization named in the URL - the query had no org/location
 * ownership check at all. `organizationId` is now a required input, and must be passed through to the Prisma
 * `where` clause so a mismatched combination can never resolve to a real row.
 */
describe('location.forLocationPage - org/location ownership', () => {
	it("passes organizationId through to Prisma's where clause alongside the location id", async () => {
		findMock.mockResolvedValue(location as never)

		await forLocationPage({
			input: { id: 'oloc_test', organizationId: 'orgn_correct' },
		} as never)

		expect(findMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ id: 'oloc_test', orgId: 'orgn_correct' }),
			})
		)
	})

	it('rejects when the location does not belong to the given organization', async () => {
		// Mirrors Prisma's real behavior: a `where` requiring both the location id and a specific orgId
		// finds no row when they don't actually match, and findUniqueOrThrow throws.
		findMock.mockImplementation((async ({ where }: { where: { id: string; orgId: string } }) => {
			if (where.id === location.id && where.orgId === 'orgn_correct') {
				return location
			}
			throw new Error('No OrgLocation found')
		}) as never)

		await expect(
			forLocationPage({ input: { id: 'oloc_test', organizationId: 'orgn_wrong' } } as never)
		).rejects.toThrow()
	})
})
