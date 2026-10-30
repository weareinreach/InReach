import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	generateId: vi.fn((prefix: string) => `${prefix}_generated`),
	generateNestedFreeText: vi.fn(),
	generateUniqueSlug: vi.fn().mockResolvedValue('test-org'),
	getAuditedClient: vi.fn(),
}))
vi.mock('@weareinreach/crowdin/api', () => ({
	addSingleKeyFromNestedFreetextCreate: vi.fn(),
	buildContextUrl: vi.fn(),
}))

const { getAuditedClient } = await import('@weareinreach/db')
const { createOrgSuggestion } = await import('./createOrgSuggestion')

const getAuditedClientMock = vi.mocked(getAuditedClient)

/**
 * Minimal mock covering every call createOrgSuggestion makes past the duplicate check, for the "allowed" test
 * cases that need to run all the way through to a successful create.
 */
const mockAllowingPrisma = (orgWebsiteUrls: string[], exception: { active: boolean } | null = null) => {
	const txCreateOperations = {
		organization: { create: vi.fn() },
		suggestion: { create: vi.fn() },
		orgWebsite: { create: vi.fn() },
	}
	getAuditedClientMock.mockReturnValue({
		orgWebsite: { findMany: vi.fn().mockResolvedValue(orgWebsiteUrls.map((url) => ({ url }))) },
		orgUrlDuplicateException: { findUnique: vi.fn().mockResolvedValue(exception) },
		user: { findUnique: vi.fn().mockResolvedValue(null) },
		$transaction: vi.fn(async (callback: (tx: typeof txCreateOperations) => unknown) =>
			callback(txCreateOperations)
		),
	} as never)
}

const baseInput = {
	countryId: 'ctry_test',
	orgName: 'Test Org',
	orgSlug: 'test-org',
	communityFocus: undefined,
	orgAddress: undefined,
} as const

const ctx = { actorId: 'user_test000000000000000000' } as unknown as never

/**
 * `createOrgSuggestion`'s submit-time duplicate check is the hard block behind both the public "Suggest an
 * Organization" form and the Data Portal's "Add an organization" modal - these tests cover the
 * exceptions-list behavior added alongside the Org URL Duplicate Check Exceptions feature: a base domain on
 * the list only suppresses the block when the full URL genuinely differs from every existing match, never
 * when it's the literal same page submitted twice.
 */
describe('createOrgSuggestion - website duplicate check with exceptions', () => {
	it('blocks a duplicate with no matching exception, same as before this feature existed', async () => {
		mockAllowingPrisma(['https://psychologytoday.com/personA'])

		await expect(
			createOrgSuggestion({
				ctx,
				input: { ...baseInput, orgWebsite: 'https://psychologytoday.com/personA' },
				sourceValue: 'suggestion',
				sourceType: 'OTHER',
			} as never)
		).rejects.toThrow('This website is already associated with an existing organization')
	})

	it('allows a duplicate domain under an active exception when the full URL differs', async () => {
		mockAllowingPrisma(['https://psychologytoday.com/personA'], { active: true })

		await expect(
			createOrgSuggestion({
				ctx,
				input: { ...baseInput, orgWebsite: 'https://psychologytoday.com/personB' },
				sourceValue: 'suggestion',
				sourceType: 'OTHER',
			} as never)
		).resolves.toEqual({ id: 'organization_generated', slug: 'test-org' })
	})

	it('still blocks the literal same URL even under an active exception', async () => {
		mockAllowingPrisma(['https://psychologytoday.com/personA'], { active: true })

		await expect(
			createOrgSuggestion({
				ctx,
				input: { ...baseInput, orgWebsite: 'https://www.PsychologyToday.com/personA/' },
				sourceValue: 'suggestion',
				sourceType: 'OTHER',
			} as never)
		).rejects.toThrow('This website is already associated with an existing organization')
	})

	it('blocks a duplicate under a deactivated (deleted) exception', async () => {
		mockAllowingPrisma(['https://psychologytoday.com/personA'], { active: false })

		await expect(
			createOrgSuggestion({
				ctx,
				input: { ...baseInput, orgWebsite: 'https://psychologytoday.com/personB' },
				sourceValue: 'suggestion',
				sourceType: 'OTHER',
			} as never)
		).rejects.toThrow('This website is already associated with an existing organization')
	})

	it('allows a genuinely new website with no matching domain at all, exception or not', async () => {
		mockAllowingPrisma([])

		await expect(
			createOrgSuggestion({
				ctx,
				input: { ...baseInput, orgWebsite: 'https://example.org' },
				sourceValue: 'suggestion',
				sourceType: 'OTHER',
			} as never)
		).resolves.toEqual({ id: 'organization_generated', slug: 'test-org' })
	})
})
