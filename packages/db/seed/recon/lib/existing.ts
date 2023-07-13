import slugify from 'slugify'

import { dayMap, hoursCorrection, hoursMeta, timezoneMap } from '~db/seed/recon/corrections/hours'
import {
	countryCorrection,
	countryOverrideId,
	govDistCorrection,
	govDistFromCity,
	govDistFromId,
} from '~db/seed/recon/corrections/location'
import { readSuperJSON, trimSpaces } from '~db/seed/recon/lib/utils'

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
	emailId: readSuperJSON<Gen.EmailIdMap>('emailIdMap'),
	phoneId: readSuperJSON<Gen.PhoneIdMap>('phoneIdMap'),
}

export const dataCorrections = {
	country: countryCorrection,
	countryOverrideById: countryOverrideId,
	govDist: govDistCorrection,
	govDistFromCity: govDistFromCity,
	govDistFromId,
}
export const hoursCorrections = {
	hours: hoursCorrection,
	days: dayMap,
	meta: hoursMeta,
	tz: timezoneMap,
}

const territories = ['as', 'gu', 'mh', 'mp', 'pr', 'pw', 'um', 'vi']

export const getGovDistId = (state: string | undefined, city: string | undefined, locId?: string) => {
	if (state && territories.includes(existing.govDistMap.get(trimSpaces(state).toLowerCase()) ?? ''))
		return undefined
	if (!state) {
		const slug =
			dataCorrections.govDistFromCity.get(trimSpaces(city ?? '')) ??
			dataCorrections.govDistFromId.get(locId ?? '')
		return slug ? existing.govDistMap.get(slug) : undefined
	}
	const slug =
		dataCorrections.govDist.get(trimSpaces(state)) ?? dataCorrections.govDist.get(`${state}-${city}`)
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
	if (
		location.state &&
		territories.includes(dataCorrections.govDist.get(location.state)?.toLowerCase() ?? '')
	) {
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

export const attribsToNotDelete = new Set([
	'attr_01GW2HHFVPSYBCYF37B44WP6CZ',
	'attr_01GW2HHFVRMQFJ9AMA633SQQGV',
	'attr_01GW2HHFVNPKMHYK12DDRVC1VJ',
	'attr_01GW2HHFVQCZPA3Z5GW6J3MQHW',
	'attr_01GW2HHFVQ8AGBKBBZJWTHNP2F',
	'attr_01GW2HHFVPTK9555WHJHDBDA2J',
	'attr_01GW2HHFVPCVX8F3B7M30ZJEHW',
	'attr_01GW2HHFVN72D7XEBZZJXCJQXQ',
	'attr_01GW2HHFVPJERY0GS9D7F56A23',
	'attr_01GW2HHFVN3RYX9JMXDZSQZM70',
	'attr_01GW2HHFVQX4M8DY1FSAYSJSSK',
	'attr_01GW2HHFVQ7SYGD3KM8WP9X50B',
	'attr_01GW2HHFVQEFWW42MBAD64BWXZ',
	'attr_01GW2HHFVNHMF72WHVKRF6W4TA',
	'attr_01GW2HHFVQVEGH6W3A2ANH1QZE',
	'attr_01GW2HHFVN3JX2J7REFFT5NAMS',
	'attr_01H273G39A14TGHT4DA1T0DW5M',
	'attr_01H273FCJ8NNG1T1BV300CN702',
	'attr_01H273FPTCFKTVBNK158HE9M42',
	'attr_01H273DMQ22TVP3RA36M1XWFBA',
	'attr_01H273GW0GN44GZ5RK1F51Z1QZ',
	'attr_01GW2HHFV5GNC11E5NVN7460QB',
	'attr_01GW2HHFV5Q7XN2ZNTYFR1AD3M',
	'attr_01H273ETEX43K0BR6FG3G7MZ4S',
	'attr_01H273GHADR15DGYH06SSN5XVG',
	'attr_01GW2HHFV5Q7XN2ZNTYFR1AD3M',
])

export const legacyAccessMap = new Map<string, string>([
	['email', 'attr_01GW2HHFVKFM4TDY4QRK4AR2ZW'],
	['file', 'attr_01GW2HHFVKMRHFD8SMDAZM3SSM'],
	['link', 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD'],
	['location', 'attr_01GW2HHFVMH6AE94EXN7T5A87C'],
	['phone', 'attr_01GW2HHFVMKTFWCKBVVFJ5GMY0'],
	['other', 'attr_01GW2HHFVMMF19AX2KPBTMV6P3'],
])
