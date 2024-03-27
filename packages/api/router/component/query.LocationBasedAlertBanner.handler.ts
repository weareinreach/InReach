import { prisma, Prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TLocationBasedAlertBannerSchema } from './query.LocationBasedAlertBanner.schema'

export const LocationBasedAlertBanner = async ({
	input,
}: TRPCHandlerParams<TLocationBasedAlertBannerSchema>) => {
	try {
		const { lat, lon } = input
		const matchedAreas = await prisma.$queryRaw<MatchedAreaResults>(Prisma.sql`
		SELECT id from "GeoData" g WHERE ST_CoveredBy(ST_Point(${lon}, ${lat}, 4326), g.geo)
		`)
		const geoIds = matchedAreas.map(({ id }) => id)

		const alerts = await prisma.locationAlert.findMany({
			where: {
				active: true,
				OR: [{ country: { geoDataId: { in: geoIds } } }, { govDist: { geoDataId: { in: geoIds } } }],
			},
			select: {
				id: true,
				level: true,
				text: { select: { tsKey: { select: { ns: true, key: true, text: true } } } },
			},
		})

		const formatted = alerts.map(
			({
				id,
				level,
				text: {
					tsKey: { key, ns, text },
				},
			}) => ({ id, level, i18nKey: key, ns, defaultText: text })
		)
		return formatted
	} catch (error) {
		handleError(error)
	}
}
export default LocationBasedAlertBanner

type MatchedAreaResults = {
	id: string
}[]
