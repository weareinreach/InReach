import { beforeEach, describe, expect, it, vi } from 'vitest'

// Correction to docs/Testing/search-api-test-inventory.md's original §5 framing: this procedure, not
// organization.getAlerts/location.getAlerts, is what actually backs the already-UI-tested
// Location-Based Alert Banner (search-test-inventory.md §14) - confirmed via
// packages/ui/components/core/LocationBasedAlertBanner/index.tsx, which calls
// `api.component.LocationBasedAlertBanner.useQuery(...)`. organization.getAlerts/location.getAlerts
// are a separate, org/location-badge-level alert feature (see their own test files in
// router/organization and router/location).
vi.mock('@weareinreach/db', async (importOriginal) => {
	const actual = await importOriginal()
	return { ...(actual as object), prisma: { $queryRaw: vi.fn(), locationAlert: { findMany: vi.fn() } } }
})

const { prisma } = await import('@weareinreach/db')
const { default: LocationBasedAlertBanner } = await import('./query.LocationBasedAlertBanner.handler')

const queryRawMock = vi.mocked(prisma.$queryRaw)
const findManyMock = vi.mocked(prisma.locationAlert.findMany)

beforeEach(() => {
	queryRawMock.mockReset()
	findManyMock.mockReset()
})

describe('component.LocationBasedAlertBanner', () => {
	it('reshapes a matched alert into the flat `{ id, level, ns, i18nKey, defaultText }` shape the UI component consumes', async () => {
		queryRawMock.mockResolvedValueOnce([{ id: 'geod_1' }] as never)
		findManyMock.mockResolvedValueOnce([
			{
				id: 'alrt_1',
				level: 'WARN_PRIMARY',
				text: { tsKey: { key: 'alert.hurricane', ns: 'alerts', text: 'Hurricane warning in effect' } },
			},
		] as never)

		const result = await LocationBasedAlertBanner({ input: { lat: 25.77, lon: -80.19 } } as never)

		expect(result).toEqual([
			{
				id: 'alrt_1',
				level: 'WARN_PRIMARY',
				ns: 'alerts',
				i18nKey: 'alert.hurricane',
				defaultText: 'Hurricane warning in effect',
			},
		])
	})

	it('passes the geo-matched area ids from the raw ST_CoveredBy lookup into the locationAlert query', async () => {
		queryRawMock.mockResolvedValueOnce([{ id: 'geod_1' }, { id: 'geod_2' }] as never)
		findManyMock.mockResolvedValueOnce([])

		await LocationBasedAlertBanner({ input: { lat: 25.77, lon: -80.19 } } as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					active: true,
					OR: [
						{ country: { geoDataId: { in: ['geod_1', 'geod_2'] } } },
						{ govDist: { geoDataId: { in: ['geod_1', 'geod_2'] } } },
					],
				},
			})
		)
	})

	it('returns an empty array, not an error, when no geo area matches the coordinates', async () => {
		queryRawMock.mockResolvedValueOnce([] as never)
		findManyMock.mockResolvedValueOnce([])

		const result = await LocationBasedAlertBanner({ input: { lat: 0, lon: 0 } } as never)

		expect(result).toEqual([])
		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					OR: [{ country: { geoDataId: { in: [] } } }, { govDist: { geoDataId: { in: [] } } }],
				}),
			})
		)
	})
})
