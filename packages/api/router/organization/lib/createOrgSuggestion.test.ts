import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	generateId: vi.fn((prefix: string) => `${prefix}_generated`),
	generateNestedFreeText: vi.fn(),
	generateUniqueSlug: vi.fn().mockResolvedValue('test-org'),
	getAuditedClient: vi.fn(),
	prisma: { orgUrlDuplicateException: { findMany: vi.fn() } },
}))
vi.mock('@weareinreach/crowdin/api', () => ({
	addSingleKeyFromNestedFreetextCreate: vi.fn(),
	buildContextUrl: vi.fn(),
}))

const { getAuditedClient, prisma } = await import('@weareinreach/db')
const { createOrgSuggestion } = await import('./createOrgSuggestion')

const getAuditedClientMock = vi.mocked(getAuditedClient)
const findExceptionsMock = vi.mocked(prisma.orgUrlDuplicateException.findMany)

/**
 * Minimal mock covering every call createOrgSuggestion makes past the duplicate check, for the "allowed" test
 * cases that need to run all the way through to a successful create.
 *
 * `exceptions` are plain `{baseUrl, active}` rows, same shape as the real table - `findMatchingException`
 * queries them via `baseUrl: {in: [...]}`, so the mock just filters by that instead of re-implementing the
 * prefix logic under test.
 */
const mockAllowingPrisma = (
	orgWebsiteUrls: string[],
	exceptions: { baseUrl: string; active: boolean }[] = []
) => {
	const txCreateOperations = {
		organization: { create: vi.fn() },
		suggestion: { create: vi.fn() },
		orgWebsite: { create: vi.fn() },
	}
	getAuditedClientMock.mockReturnValue({
		orgWebsite: { findMany: vi.fn().mockResolvedValue(orgWebsiteUrls.map((url) => ({ url }))) },
		user: { findUnique: vi.fn().mockResolvedValue(null) },
		$transaction: vi.fn(async (callback: (tx: typeof txCreateOperations) => unknown) =>
			callback(txCreateOperations)
		),
	} as never)
	findExceptionsMock.mockImplementation((async (args: { where: { baseUrl: { in: string[] } } }) =>
		exceptions.filter((exception) => args.where.baseUrl.in.includes(exception.baseUrl))) as never)
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

	it('allows a duplicate domain under an active domain-wide exception when the full URL differs', async () => {
		mockAllowingPrisma(
			['https://psychologytoday.com/personA'],
			[{ baseUrl: 'psychologytoday.com', active: true }]
		)

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
		mockAllowingPrisma(
			['https://psychologytoday.com/personA'],
			[{ baseUrl: 'psychologytoday.com', active: true }]
		)

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
		mockAllowingPrisma(
			['https://psychologytoday.com/personA'],
			[{ baseUrl: 'psychologytoday.com', active: false }]
		)

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

	it('allows a duplicate under a narrower active path-prefix exception when the full URL differs', async () => {
		mockAllowingPrisma(
			['https://healthgrades.com/doctors/personA'],
			[{ baseUrl: 'healthgrades.com/doctors', active: true }]
		)

		await expect(
			createOrgSuggestion({
				ctx,
				input: { ...baseInput, orgWebsite: 'https://healthgrades.com/doctors/personB' },
				sourceValue: 'suggestion',
				sourceType: 'OTHER',
			} as never)
		).resolves.toEqual({ id: 'organization_generated', slug: 'test-org' })
	})

	it('does not let a narrower path-prefix exception cover a sibling path on the same domain', async () => {
		mockAllowingPrisma(
			['https://healthgrades.com/doctors/personA'],
			[{ baseUrl: 'healthgrades.com/doctors', active: true }]
		)

		await expect(
			createOrgSuggestion({
				ctx,
				// Same domain (so still a domain-level duplicate match), but under a different path than the
				// exception covers - the exception must not leak coverage to the rest of the domain.
				input: { ...baseInput, orgWebsite: 'https://healthgrades.com/lawyers/personA' },
				sourceValue: 'suggestion',
				sourceType: 'OTHER',
			} as never)
		).rejects.toThrow('This website is already associated with an existing organization')
	})

	it('respects path-segment boundaries - "test.com/dr" is not covered by a "test.com/drs" exception', async () => {
		mockAllowingPrisma(['https://test.com/drs/personA'], [{ baseUrl: 'test.com/drs', active: true }])

		await expect(
			createOrgSuggestion({
				ctx,
				input: { ...baseInput, orgWebsite: 'https://test.com/dr' },
				sourceValue: 'suggestion',
				sourceType: 'OTHER',
			} as never)
		).rejects.toThrow('This website is already associated with an existing organization')
	})

	it('blocks a bare domain when only a narrower path-prefix exception exists for that domain', async () => {
		mockAllowingPrisma(['https://test.com/drs'], [{ baseUrl: 'test.com/drs', active: true }])

		// A narrower exception ("test.com/drs") doesn't reach upward to cover the bare domain above it -
		// confirmed as the intended (not buggy) behavior after walking through it with the product owner.
		await expect(
			createOrgSuggestion({
				ctx,
				input: { ...baseInput, orgWebsite: 'https://test.com' },
				sourceValue: 'suggestion',
				sourceType: 'OTHER',
			} as never)
		).rejects.toThrow('This website is already associated with an existing organization')
	})

	it('allows a bare domain as the very first use of that domain, even with only a narrower exception listed', async () => {
		mockAllowingPrisma([], [{ baseUrl: 'test.com/drs', active: true }])

		// Nothing exists yet on this domain, so there's no duplicate to suppress in the first place - the
		// exceptions list never even gets consulted.
		await expect(
			createOrgSuggestion({
				ctx,
				input: { ...baseInput, orgWebsite: 'https://test.com' },
				sourceValue: 'suggestion',
				sourceType: 'OTHER',
			} as never)
		).resolves.toEqual({ id: 'organization_generated', slug: 'test-org' })
	})

	it('lets a domain-wide exception dominate when a narrower exception for the same domain also exists', async () => {
		mockAllowingPrisma(
			['https://test.com/drs/personA'],
			[
				{ baseUrl: 'test.com', active: true },
				{ baseUrl: 'test.com/drs', active: true },
			]
		)

		// The domain-wide exception already covers everything the narrower one does, including paths outside
		// "/drs" - the two entries don't conflict, the broader one just makes the narrower one redundant.
		await expect(
			createOrgSuggestion({
				ctx,
				input: { ...baseInput, orgWebsite: 'https://test.com/lawyers/personA' },
				sourceValue: 'suggestion',
				sourceType: 'OTHER',
			} as never)
		).resolves.toEqual({ id: 'organization_generated', slug: 'test-org' })
	})
})
