import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({ prisma: { organization: { findUnique: vi.fn() } } }))

const { prisma } = await import('@weareinreach/db')
const { default: generateSlug } = await import('./query.generateSlug.handler')

const findUniqueMock = vi.mocked(prisma.organization.findUnique)

/**
 * This is a public, unauthenticated endpoint - treating an unpublished org's slug as "taken" would reveal
 * that it exists (the suggestion would come back with an unexplained "-1" suffix). Only a published org's
 * slug should block the name-based suggestion; an unpublished conflict is still caught safely at actual
 * creation time by generateUniqueSlug (packages/db/lib/slugGen.ts), which checks every org regardless of
 * publish status and falls back to an id-suffixed slug.
 */
describe('organization.generateSlug - only published orgs count as taken', () => {
	it('passes published: true in the uniqueness check', async () => {
		findUniqueMock.mockResolvedValue(null)

		await generateSlug({ input: 'Acme Inc' } as never)

		expect(findUniqueMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: expect.objectContaining({ published: true }) })
		)
	})

	it('suggests the plain slug when only an unpublished org holds it', async () => {
		// Simulates the real published-only filter: an unpublished org with this slug never matches.
		findUniqueMock.mockImplementation((async ({ where }: { where: { published?: boolean } }) =>
			where.published ? null : { slug: 'acme-inc' }) as never)

		await expect(generateSlug({ input: 'Acme Inc' } as never)).resolves.toBe('acme-inc')
	})

	it('still suffixes when a published org holds the plain slug', async () => {
		findUniqueMock.mockResolvedValueOnce({ slug: 'acme-inc' } as never).mockResolvedValueOnce(null)

		await expect(generateSlug({ input: 'Acme Inc' } as never)).resolves.toBe('acme-inc-1')
	})
})
