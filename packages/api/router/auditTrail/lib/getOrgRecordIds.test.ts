import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: { organization: { findUnique: vi.fn() } },
}))

const { prisma } = await import('@weareinreach/db')
const { getOrgRecordIds } = await import('./getOrgRecordIds')

const findUniqueMock = vi.mocked(prisma.organization.findUnique)

describe('getOrgRecordIds', () => {
	it('returns an empty array when the org does not exist', async () => {
		findUniqueMock.mockResolvedValueOnce(null)

		expect(await getOrgRecordIds('orgn_missing')).toEqual([])
	})

	it('includes the org itself plus every directly-linked hours/phone/email id', async () => {
		findUniqueMock.mockResolvedValueOnce({
			id: 'orgn_1',
			hours: [{ id: 'ohrs_org' }],
			emails: [{ orgEmailId: 'oeml_org' }],
			phones: [{ phoneId: 'ophn_org' }],
			services: [],
			locations: [],
		} as never)

		const ids = await getOrgRecordIds('orgn_1')

		expect(ids).toEqual(expect.arrayContaining(['orgn_1', 'ohrs_org', 'oeml_org', 'ophn_org']))
	})

	/**
	 * Regression: the previous query only matched rows whose own `new` payload had a flat `organizationId`/
	 * `orgId` field - a service linked ONLY through a location (not directly to the org) was missed entirely,
	 * and so was anything (hours/phones/emails) linked to that service.
	 */
	it('includes a service linked only through a location, and its own hours/phone/email', async () => {
		findUniqueMock.mockResolvedValueOnce({
			id: 'orgn_1',
			hours: [],
			emails: [],
			phones: [],
			services: [],
			locations: [
				{
					id: 'oloc_1',
					hours: [{ id: 'ohrs_loc' }],
					emails: [{ orgEmailId: 'oeml_loc' }],
					phones: [{ phoneId: 'ophn_loc' }],
					services: [
						{
							service: {
								id: 'osvc_1',
								hours: [{ id: 'ohrs_svc' }],
								emails: [{ orgEmailId: 'oeml_svc' }],
								phones: [{ orgPhoneId: 'ophn_svc' }],
							},
						},
					],
				},
			],
		} as never)

		const ids = await getOrgRecordIds('orgn_1')

		expect(ids).toEqual(
			expect.arrayContaining([
				'orgn_1',
				'oloc_1',
				'ohrs_loc',
				'oeml_loc',
				'ophn_loc',
				'osvc_1',
				'ohrs_svc',
				'oeml_svc',
				'ophn_svc',
			])
		)
	})

	it('deduplicates a service that is both directly org-linked and linked through a location', async () => {
		findUniqueMock.mockResolvedValueOnce({
			id: 'orgn_1',
			hours: [],
			emails: [],
			phones: [],
			services: [{ id: 'osvc_shared', hours: [], emails: [], phones: [] }],
			locations: [
				{
					id: 'oloc_1',
					hours: [],
					emails: [],
					phones: [],
					services: [{ service: { id: 'osvc_shared', hours: [], emails: [], phones: [] } }],
				},
			],
		} as never)

		const ids = await getOrgRecordIds('orgn_1')

		expect(ids.filter((id) => id === 'osvc_shared')).toHaveLength(1)
	})
})
