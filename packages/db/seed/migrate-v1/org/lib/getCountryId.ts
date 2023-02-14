import { countryTranslation, govDistMap, missingCountryMap } from '~db/datastore/v1/helpers/locDataMaps'
import { type Location } from '~db/datastore/v1/mongodb/output-types/organizations'
import { type CountryMap } from '~db/seed/migrate-v1/org/lib'

export const getCountryId = (location: Location, countryMap: CountryMap) => {
	if (!location.country) location.country = missingCountryMap.get(location._id.$oid)
	if (location.state && ['PR', 'GU', 'VI'].includes(govDistMap.get(location.state) ?? ''))
		location.country = govDistMap.get(location.state)
	if (!location.country) throw new Error(`Location missing Country`)

	const cca2 = countryTranslation.get(location.country)
	if (!cca2) throw new Error(`Unable to map country: ${location.country}`)
	const countryId = countryMap.get(cca2)
	if (!countryId) throw new Error(`Unable to map country: ${cca2}`)
	return countryId
}
