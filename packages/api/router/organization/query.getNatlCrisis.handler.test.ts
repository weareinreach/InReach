import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', async (importOriginal) => {
	const actual = await importOriginal()
	return { ...(actual as object), prisma: { organization: { findMany: vi.fn() } } }
})

const { prisma } = await import('@weareinreach/db')
const { default: getNatlCrisis } = await import('./query.getNatlCrisis.handler')

const findManyMock = vi.mocked(prisma.organization.findMany)

beforeEach(() => {
	findManyMock.mockReset()
})

describe('organization.getNatlCrisis', () => {
	it('6.5: returns an empty array, not an error, when no crisis-support-only services exist for the country', async () => {
		findManyMock.mockResolvedValueOnce([])

		const result = await getNatlCrisis({ input: { cca2: 'ZZ' } } as never)

		expect(result).toEqual([])
	})

	it('scopes the query to crisisSupportOnly services active in the given country', async () => {
		findManyMock.mockResolvedValueOnce([])

		await getNatlCrisis({ input: { cca2: 'US' } } as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					services: {
						some: {
							crisisSupportOnly: true,
							serviceAreas: { active: true, countries: { some: { country: { cca2: 'US' } } } },
						},
					},
				}),
			})
		)
	})

	it('reshapes a matched org into `{ id, name, accessInstructions, description, community }`', async () => {
		findManyMock.mockResolvedValueOnce([
			{
				id: 'orgn_1',
				name: 'National Crisis Line',
				services: [
					{
						description: { tsKey: { key: 'desc.key', text: 'Crisis hotline description' } },
						attributes: [
							{
								data: { access_type: 'phone', access_value: '988' },
								text: null,
								attribute: {
									icon: 'phone',
									tsKey: 'attr.phone-access',
									tag: 'phone-access',
									categories: [{ category: { tag: 'service-access-instructions' } }],
								},
							},
							{
								data: null,
								text: null,
								attribute: {
									icon: 'community',
									tsKey: 'attr.lgbtq',
									tag: 'lgbtq-focused',
									categories: [{ category: { tag: 'service-focus' } }],
								},
							},
						],
					},
				],
			},
		] as never)

		const result = await getNatlCrisis({ input: { cca2: 'US' } } as never)

		expect(result).toEqual([
			{
				id: 'orgn_1',
				name: 'National Crisis Line',
				description: { key: 'desc.key', text: 'Crisis hotline description' },
				accessInstructions: [{ tag: 'phone-access', access_type: 'phone', access_value: '988' }],
				community: { tsKey: 'attr.lgbtq', icon: 'community' },
			},
		])
	})
})
