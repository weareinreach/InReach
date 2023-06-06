import { type Location } from '~db/datastore/out-data/2023-06-06/organizations'
import { govDistMap, missingDistCityMap } from '~db/datastore/v1/helpers/locDataMaps'
import { type DistMap } from '~db/seed/migrate-v1/org/lib/getReferenceData'

export const getGovDistId = (location: Location, distMap: DistMap) => {
	if (location.state && ['PR', 'GU', 'VI'].includes(govDistMap.get(location.state) ?? '')) return undefined
	if (!location.state) {
		const slug = missingDistCityMap.get(location.city ?? '')
		return slug ? distMap.get(slug)?.id : undefined
	}
	const slug = govDistMap.get(location.state)
	return slug ? distMap.get(slug)?.id : undefined
}
