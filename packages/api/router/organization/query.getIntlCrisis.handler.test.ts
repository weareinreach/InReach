import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: { organization: { findMany: vi.fn() } },
}))

const { prisma } = await import('@weareinreach/db')
const { default: getIntlCrisis } = await import('./query.getIntlCrisis.handler')

const findManyMock = vi.mocked(prisma.organization.findMany)

const baseOrg = {
	id: 'orgn_1',
	name: 'Crisis Org',
	description: null,
	attributes: [],
	services: [],
}

beforeEach(() => {
	findManyMock.mockReset()
})

describe('organization.getIntlCrisis', () => {
	it("6.1: cca2 'ZZ' filters for international resources (excludes US/CA/MX) rather than a specific country", async () => {
		findManyMock.mockResolvedValueOnce([])

		await getIntlCrisis({ input: { cca2: 'ZZ' } } as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					serviceAreas: expect.objectContaining({
						countries: { some: { country: { cca2: { notIn: ['US', 'CA', 'MX'] } } } },
					}),
				}),
			})
		)
	})

	it('6.1b: an omitted cca2 behaves the same as ZZ', async () => {
		findManyMock.mockResolvedValueOnce([])

		await getIntlCrisis({ input: {} } as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					serviceAreas: expect.objectContaining({
						countries: { some: { country: { cca2: { notIn: ['US', 'CA', 'MX'] } } } },
					}),
				}),
			})
		)
	})

	it('6.2: a real cca2 filters for that specific country only', async () => {
		findManyMock.mockResolvedValueOnce([])

		await getIntlCrisis({ input: { cca2: 'FR' } } as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					serviceAreas: expect.objectContaining({ countries: { some: { country: { cca2: 'FR' } } } }),
				}),
			})
		)
	})

	it('6.4a: parses a plain (non-superjson) access-instruction data value', async () => {
		findManyMock.mockResolvedValueOnce([
			{
				...baseOrg,
				services: [
					{
						attributes: [
							{
								attribute: { tag: 'phone-access' },
								data: { access_type: 'phone', access_value: '+33123456789' },
							},
						],
						services: [],
					},
				],
			},
		] as never)

		const result = await getIntlCrisis({ input: { cca2: 'FR' } } as never)

		expect(result[0]?.accessInstructions).toEqual([
			{ tag: 'phone-access', access_type: 'phone', access_value: '+33123456789' },
		])
	})

	it('6.4b: parses a superjson-wrapped access-instruction data value the same way', async () => {
		findManyMock.mockResolvedValueOnce([
			{
				...baseOrg,
				services: [
					{
						attributes: [
							{
								attribute: { tag: 'phone-access' },
								data: { json: { access_type: 'phone', access_value: '+33123456789' } },
							},
						],
						services: [],
					},
				],
			},
		] as never)

		const result = await getIntlCrisis({ input: { cca2: 'FR' } } as never)

		expect(result[0]?.accessInstructions).toEqual([
			{ tag: 'phone-access', access_type: 'phone', access_value: '+33123456789' },
		])
	})
})
