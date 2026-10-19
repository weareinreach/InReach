import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', async (importOriginal) => {
	const actual = await importOriginal()
	return { ...(actual as object), prisma: { orgLocation: { findUniqueOrThrow: vi.fn() } } }
})

const { prisma } = await import('@weareinreach/db')
const { default: forLocationCard } = await import('./query.forLocationCard.handler')

const findMock = vi.mocked(prisma.orgLocation.findUniqueOrThrow)

const hiddenLocation = {
	id: 'oloc_test',
	name: 'Clinic',
	street1: '123 Main St',
	street2: 'Suite 4',
	city: 'Springfield',
	postCode: '12345',
	latitude: 40.1,
	longitude: -75.2,
	addressVisibility: 'HIDDEN',
	published: true,
	deleted: false,
	country: { cca2: 'US' },
	govDist: { abbrev: 'IL', tsKey: 'gov.il', tsNs: 'gov-dist' },
	phones: [],
	attributes: [],
	services: [],
}

const staff = { session: { user: { permissions: ['dataPortalBasic'] } } }

beforeEach(() => {
	findMock.mockReset().mockResolvedValue(hiddenLocation as never)
})

/**
 * #2011: forLocationCard didn't pass edit mode to the address redaction, so staff editing an org saw no city
 * or district at all for a location whose address is HIDDEN - unlike forVisitCardEdits. The street, postcode
 * and coordinates stay redacted even for staff.
 */
describe('location.forLocationCard - HIDDEN address', () => {
	it('staff in edit mode get the city and district, with the street still redacted', async () => {
		const result = await forLocationCard({
			input: { id: 'oloc_test', isEditMode: true },
			ctx: staff,
		} as never)

		expect(result).toMatchObject({ city: 'Springfield', govDist: { abbrev: 'IL' } })
		expect(result).toMatchObject({
			street1: null,
			street2: null,
			postCode: null,
			latitude: null,
			longitude: null,
		})
	})

	it('the public card shows none of it', async () => {
		const result = await forLocationCard({ input: { id: 'oloc_test', isEditMode: false }, ctx: {} } as never)

		expect(result).toMatchObject({ city: null, govDist: null, street1: null })
	})

	it('a request claiming edit mode without a staff session still gets the public redaction', async () => {
		const result = await forLocationCard({ input: { id: 'oloc_test', isEditMode: true }, ctx: {} } as never)

		expect(result).toMatchObject({ city: null, govDist: null })
	})
})
