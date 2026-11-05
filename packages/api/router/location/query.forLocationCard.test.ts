import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	Prisma: { PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {} },
	PrismaEnums: { AddressVisibility: { FULL: 'FULL', PARTIAL: 'PARTIAL', HIDDEN: 'HIDDEN' } },
	prisma: {
		orgLocation: {
			findUniqueOrThrow: vi.fn().mockResolvedValue({
				id: 'oloc_test',
				name: 'Test Location',
				street1: '123 Main St',
				street2: null,
				city: 'Springfield',
				postCode: '00000',
				latitude: 1,
				longitude: 1,
				addressVisibility: 'FULL',
				published: true,
				deleted: false,
				country: { cca2: 'US' },
				govDist: { abbrev: 'IL', tsKey: 'gov.il', tsNs: 'gov-dist' },
				phones: [],
				attributes: [],
				services: [],
			}),
		},
	},
}))

const { prisma } = await import('@weareinreach/db')
const { default: forLocationCard } = await import('./query.forLocationCard.handler')

const findUniqueOrThrowMock = vi.mocked(prisma.orgLocation.findUniqueOrThrow)

/**
 * Regression: `canSeeAll` was `isEditMode && !!ctx.session?.user?.permissions` - `permissions` is always a
 * (possibly empty) array for any signed-in session, so this was `true` for literally any logged-in user, not
 * just staff. Any registered account could pass `isEditMode: true` and see a hidden location's full address
 * and phone numbers.
 */
describe('forLocationCard - isEditMode only bypasses visibility for Data Portal staff', () => {
	it('ignores isEditMode for an anonymous caller (no session)', async () => {
		await forLocationCard({ ctx: { session: null }, input: { id: 'oloc_test', isEditMode: true } } as never)

		expect(findUniqueOrThrowMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: expect.objectContaining({ published: true, deleted: false }) })
		)
	})

	it('ignores isEditMode for a signed-in caller with no Data Portal permissions', async () => {
		await forLocationCard({
			ctx: { session: { user: { permissions: [] } } },
			input: { id: 'oloc_test', isEditMode: true },
		} as never)

		expect(findUniqueOrThrowMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: expect.objectContaining({ published: true, deleted: false }) })
		)
	})

	it('honors isEditMode for a staff caller with Data Portal access', async () => {
		await forLocationCard({
			ctx: { session: { user: { permissions: ['dataPortalManager'] } } },
			input: { id: 'oloc_test', isEditMode: true },
		} as never)

		const call = findUniqueOrThrowMock.mock.calls.at(-1)?.[0]
		expect(call?.where).not.toHaveProperty('published')
	})
})
