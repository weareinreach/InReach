import { hoursCorrection } from '~db/seed/recon/corrections/hours'
import {
	countryCorrection,
	countryOverrideId,
	govDistCorrection,
	govDistFromCity,
} from '~db/seed/recon/corrections/location'
import { readSuperJSON } from '~db/seed/recon/lib/utils'

import type * as Gen from '~db/seed/recon/generated/types'

export const existing = {
	orgId: readSuperJSON<Gen.OrgIdMap>('orgIdMap'),
	orgSlug: readSuperJSON<Gen.OrgSlugSet>('orgSlugSet'),
	locationId: readSuperJSON<Gen.LocationIdMap>('locationIdMap'),
	serviceId: readSuperJSON<Gen.ServiceIdMap>('serviceIdMap'),
	serviceTag: readSuperJSON<Gen.ServiceTagMap>('serviceTagMap'),
	attribute: readSuperJSON<Gen.AttributeMap>('attributeMap'),
	language: readSuperJSON<Gen.LanguageMap>('languageMap'),
	socialMediaService: readSuperJSON<Gen.SocialMediaMap>('socialMediaMap'),
	userType: readSuperJSON<Gen.UserTypeMap>('userTypeMap'),
	userId: readSuperJSON<Gen.UserIdMap>('userIdMap'),
	permission: readSuperJSON<Gen.PermissionMap>('permissionMap'),
	country: readSuperJSON<Gen.CountryMap>('countryMap'),
	govDistList: readSuperJSON<Gen.DistList>('distList'),
	govDistMap: readSuperJSON<Gen.DistMap>('distMap'),
}

export const dataCorrections = {
	hours: hoursCorrection,
	country: countryCorrection,
	countryOverrideById: countryOverrideId,
	govDist: govDistCorrection,
	govDistFromCity: govDistFromCity,
}

const territories = ['as', 'gu', 'mh', 'mp', 'pr', 'pw', 'um', 'vi']

export const getGovDistId = (state: string | undefined, city: string | undefined) => {
	if (state && territories.includes(existing.govDistMap.get(state.toLowerCase()) ?? '')) return undefined
	if (!state) {
		const slug = dataCorrections.govDistFromCity.get(city ?? '')
		return slug ? existing.govDistMap.get(slug.toLowerCase()) : undefined
	}
	const slug = dataCorrections.govDist.get(state.toLowerCase())
	return slug ? existing.govDistMap.get(slug) : undefined
}

export const getCountryId = (
	country: string | undefined,
	state: string | undefined,
	locationLegacyId: string
) => {
	const location = {
		country,
		state,
		id: locationLegacyId,
	}
	if (!location.country) {
		location.country = dataCorrections.countryOverrideById.get(location.id)
	}
	if (location.state && territories.includes(dataCorrections.govDist.get(location.state) ?? '')) {
		location.country = dataCorrections.govDist.get(location.state)
	}
	if (!location.country) {
		throw new Error(`Location missing Country`, { cause: location })
	}
	const cca2 = dataCorrections.country.get(location.country)
	if (!cca2) {
		throw new Error(`Unable to map country: ${location.country}`, { cause: location })
	}
	const countryId = existing.country.get(cca2.toLowerCase())
	if (!countryId) {
		throw new Error(`Unable to map country: ${cca2}`, { cause: location })
	}
	return countryId
}
