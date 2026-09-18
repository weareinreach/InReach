import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: { orgPhone: { findUnique: vi.fn() } },
}))

const { prisma } = await import('@weareinreach/db')
const { default: forEditDrawer } = await import('./query.forEditDrawer.handler')

const findUniqueMock = vi.mocked(prisma.orgPhone.findUnique)

describe('orgPhone.forEditDrawer', () => {
	it('returns null when the phone does not exist', async () => {
		findUniqueMock.mockResolvedValueOnce(null)

		const result = await forEditDrawer({
			input: { id: 'orgPhone_missing', orgId: 'organization_test' },
		} as never)

		expect(result).toBeNull()
	})

	it('formats a parseable number to E.164 and applies the extension', async () => {
		findUniqueMock.mockResolvedValueOnce({
			id: 'orgPhone_test',
			number: '5555550100',
			ext: '123',
			primary: false,
			published: true,
			deleted: false,
			countryId: 'country_us',
			phoneTypeId: null,
			description: null,
			locationOnly: false,
			serviceOnly: false,
			country: { cca2: 'US' },
		} as never)

		const result = await forEditDrawer({
			input: { id: 'orgPhone_test', orgId: 'organization_test' },
		} as never)

		expect(result?.number).toBe('+15555550100')
	})

	/**
	 * Legacy/malformed numbers that libphonenumber-js can't parse fall back to returning the raw saved value
	 * untouched, rather than throwing - this is the server-side half of the client's own raw-fallback rendering
	 * in PhoneNumberEntry (withHookForm.tsx).
	 */
	it('returns the raw saved number as-is when it cannot be parsed', async () => {
		findUniqueMock.mockResolvedValueOnce({
			id: 'orgPhone_test',
			number: 'not-a-real-number',
			ext: null,
			primary: false,
			published: true,
			deleted: false,
			countryId: 'country_us',
			phoneTypeId: null,
			description: null,
			locationOnly: false,
			serviceOnly: false,
			country: { cca2: 'US' },
		} as never)

		const result = await forEditDrawer({
			input: { id: 'orgPhone_test', orgId: 'organization_test' },
		} as never)

		expect(result?.number).toBe('not-a-real-number')
	})

	it('maps a null description to null rather than an empty object', async () => {
		findUniqueMock.mockResolvedValueOnce({
			id: 'orgPhone_test',
			number: '5555550100',
			ext: null,
			primary: false,
			published: true,
			deleted: false,
			countryId: 'country_us',
			phoneTypeId: null,
			description: null,
			locationOnly: false,
			serviceOnly: false,
			country: { cca2: 'US' },
		} as never)

		const result = await forEditDrawer({
			input: { id: 'orgPhone_test', orgId: 'organization_test' },
		} as never)

		expect(result?.description).toBeNull()
	})

	it('extracts the description text when one exists', async () => {
		findUniqueMock.mockResolvedValueOnce({
			id: 'orgPhone_test',
			number: '5555550100',
			ext: null,
			primary: false,
			published: true,
			deleted: false,
			countryId: 'country_us',
			phoneTypeId: null,
			description: { id: 'freeText_1', key: 'phoneDesc.1', tsKey: { text: 'Front desk' } },
			locationOnly: false,
			serviceOnly: false,
			country: { cca2: 'US' },
		} as never)

		const result = await forEditDrawer({
			input: { id: 'orgPhone_test', orgId: 'organization_test' },
		} as never)

		expect(result?.description).toBe('Front desk')
	})
})
