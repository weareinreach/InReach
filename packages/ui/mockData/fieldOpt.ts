import { z } from 'zod'

import { type ApiOutput } from '@weareinreach/api'
import { type $Enums } from '@weareinreach/db'
import { getTRPCMock, type MockAPIHandler, type MockHandlerObject } from '~ui/lib/getTrpcMock'

const queryAttributeCategories: MockAPIHandler<'fieldOpt', 'attributeCategories'> = async (query) => {
	const attributeCategories = (await import('./json/fieldOpt.attributeCategories.json')).default
	if (Array.isArray(query)) {
		return attributeCategories.filter(({ tag }) => query.includes(tag))
	}
	return attributeCategories
}

const queryAttributesByCategory: MockAPIHandler<'fieldOpt', 'attributesByCategory'> = async (query) => {
	const attributesByCategory = (await import('./json/fieldOpt.attributesByCategory.json'))
		.default as ApiOutput['fieldOpt']['attributesByCategory']

	if (query?.categoryName || query?.canAttachTo?.length) {
		const canAttachSet = new Set(query.canAttachTo)
		const catNameSet = new Set(Array.isArray(query.categoryName) ? query.categoryName : [query.categoryName])
		return attributesByCategory.filter(({ canAttachTo, categoryName }) => {
			let match = false

			if (query.canAttachTo?.length) {
				for (const item of canAttachTo) {
					if (canAttachSet.has(item as $Enums.AttributeAttachment)) {
						match = true
						break
					}
				}
			}
			if (query.categoryName) {
				match = catNameSet.has(categoryName)
			}

			return match
		})
	}

	return attributesByCategory
}

const queryLanguages: MockAPIHandler<'fieldOpt', 'languages'> = async (query) => {
	const languages = (await import('./json/fieldOpt.languages.json')).default
	const { localeCode, activelyTranslated } = query ?? {}
	if (localeCode || activelyTranslated) {
		return languages.filter((record) => {
			switch (true) {
				case Boolean(localeCode) && activelyTranslated !== undefined: {
					return localeCode === record.localeCode && activelyTranslated === record.activelyTranslated
				}
				case Boolean(localeCode): {
					return localeCode === record.localeCode
				}
				case activelyTranslated !== undefined: {
					return activelyTranslated === record.activelyTranslated
				}
			}
			return false
		})
	}
	return languages
}

const queryCountries: MockAPIHandler<'fieldOpt', 'countries'> = async (query) => {
	const countries = (await import('./json/fieldOpt.countries.json')).default
	if (query) {
		const { activeForOrgs, cca2 } = query
		return countries.filter(
			(record) =>
				(activeForOrgs !== undefined ? activeForOrgs === record.activeForOrgs : true) &&
				(cca2 ? cca2 === record.cca2 : true)
		)
	}
	return countries
}

const queryGovDistsByCountry: MockAPIHandler<'fieldOpt', 'govDistsByCountry'> = async (query) => {
	const govDistsByCountry = (await import('./json/fieldOpt.govDistsByCountry.json')).default
	if (query) {
		return govDistsByCountry.filter(({ cca2 }) => cca2 === query)
	}
	return govDistsByCountry
}

const queryGovDistsByCountryNoSub: MockAPIHandler<'fieldOpt', 'govDistsByCountryNoSub'> = async (query) => {
	const govDistByCountryNoSub = (await import('./json/fieldOpt.govDistsByCountryNoSub.json')).default
	if (query) {
		return govDistByCountryNoSub.filter(({ cca2 }) => cca2 === query)
	}
	return govDistByCountryNoSub
}

export const phoneTypes = [
	{
		id: 'phtp_01GXRXCWJG3F358K8QBX7C08R7',
		tsKey: 'fax',
		tsNs: 'phone-type',
	},
	{
		id: 'phtp_01GXRXCWJGZQDYF577AGZASTPQ',
		tsKey: 'hotline',
		tsNs: 'phone-type',
	},
	{
		id: 'phtp_01GXRXCWJGNF3JF8DEY1EWP1JW',
		tsKey: 'office',
		tsNs: 'phone-type',
	},
	{
		id: 'phtp_01GXRXCWJG7PGQH1A6GGBKATZ4',
		tsKey: 'sms',
		tsNs: 'phone-type',
	},
	{
		id: 'phtp_01GXRXCWJGCZFWCHBGFA5AE5YK',
		tsKey: 'whatsapp',
		tsNs: 'phone-type',
	},
] satisfies ApiOutput['fieldOpt']['phoneTypes']

export const userTitle = [
	{
		id: 'uttl_000000000',
		title: 'User Title 1',
	},
	{
		id: 'uttl_000000001',
		title: 'User Title 2',
	},
] satisfies ApiOutput['fieldOpt']['userTitle']

const countryGovDistBasicItem = {
	id: z.string(),
	tsKey: z.string(),
	tsNs: z.string(),
}

const countryGovDistMapSchema = z
	.tuple([
		z.string(),
		z.object({
			...countryGovDistBasicItem,
			children: z.object(countryGovDistBasicItem).array(),
			parent: z
				.object({ ...countryGovDistBasicItem, parent: z.object(countryGovDistBasicItem).optional() })
				.optional(),
		}),
	])
	.array()

const countryGovDistMap = async () => {
	const { default: countryGovDistMapData } = (await import('./json/fieldOpt.countryGovDistMap.json')) as {
		default: unknown
	}
	return new Map<string, CountryGovDistMapItem>(countryGovDistMapSchema.parse(countryGovDistMapData))
}
const getSubDistricts: MockAPIHandler<'fieldOpt', 'getSubDistricts'> = async (id) => {
	const data = (await import('./json/fieldOpt.getSubDistricts.json')).default
	const filtered = data.filter(({ parentId }) => parentId === id)
	const formatted = filtered.map(({ parentId: _parentId, ...rest }) => rest)
	return formatted
}
export const fieldOpt = {
	attributeCategories: getTRPCMock({
		path: ['fieldOpt', 'attributeCategories'],
		response: async (input) => await queryAttributeCategories(input),
	}),
	attributesByCategory: getTRPCMock({
		path: ['fieldOpt', 'attributesByCategory'],
		response: async (input) => await queryAttributesByCategory(input),
	}),
	languages: getTRPCMock({
		path: ['fieldOpt', 'languages'],
		response: async (input) => await queryLanguages(input),
	}),
	countries: getTRPCMock({
		path: ['fieldOpt', 'countries'],
		response: async (input) => await queryCountries(input),
	}),
	govDistsByCountry: getTRPCMock({
		path: ['fieldOpt', 'govDistsByCountry'],
		response: queryGovDistsByCountry,
	}),
	govDistsByCountryNoSub: getTRPCMock({
		path: ['fieldOpt', 'govDistsByCountryNoSub'],
		response: queryGovDistsByCountryNoSub,
	}),
	phoneTypes: getTRPCMock({
		path: ['fieldOpt', 'phoneTypes'],
		response: phoneTypes,
	}),
	userTitle: getTRPCMock({
		path: ['fieldOpt', 'userTitle'],
		response: userTitle,
	}),
	countryGovDistMap: getTRPCMock({
		path: ['fieldOpt', 'countryGovDistMap'],
		response: async () => await countryGovDistMap(),
	}),
	getSubDistricts: getTRPCMock({
		path: ['fieldOpt', 'getSubDistricts'],
		response: async (input) => await getSubDistricts(input),
	}),
	govDists: getTRPCMock({
		path: ['fieldOpt', 'govDists'],
		response: async (input) => {
			const data = (await import('./json/fieldOpt.govDists.json')).default as GovDistFieldOpts[]

			if (input) {
				const { parentsOnly, ...search } = input
				const filtered = data.filter((item) => {
					let isMatch = false
					// @ts-expect-error key type
					isMatch = Object.entries(search).every(([key, value]) => item[key] && item[key] === value)
					if (parentsOnly) {
						isMatch = isMatch && item.parentId === null
					}
					return isMatch
				})
				const formattedFiltered = filtered.map(({ parentId: _parentId, ...rest }) => rest)
				return formattedFiltered
			}
			const formatted = data.map(({ parentId: _parentId, ...rest }) => rest)
			return formatted
		},
	}),
	orgBadges: getTRPCMock({
		path: ['fieldOpt', 'orgBadges'],
		response: async (input) => {
			switch (input.badgeType) {
				case 'organization-leadership': {
					const { default: data } = await import('./json/fieldOpt.orgBadges.organization-leadership.json')
					return data
				}
				case 'service-focus': {
					const { default: data } = await import('./json/fieldOpt.orgBadges.service-focus.json')
					return data
				}
			}
		},
	}),
	ccaMap: getTRPCMock({
		path: ['fieldOpt', 'ccaMap'],
		response: async ({ activeForOrgs }) => {
			const { default: data } = await import('./json/fieldOpt.ccaMap.json')
			const dataToUse = activeForOrgs ? data.true : data.false
			return {
				byId: new Map(Object.entries(dataToUse.byId)),
				byCCA: new Map(Object.entries(dataToUse.byCCA)),
			}
		},
	}),
} satisfies MockHandlerObject<'fieldOpt'>

export const allFieldOptHandlers = Object.values(fieldOpt)

interface CountryGovDistMapItemBasic {
	id: string
	tsKey: string
	tsNs: string
}

interface CountryGovDistMapItem {
	id: string
	tsKey: string
	tsNs: string
	children: CountryGovDistMapItemBasic[]
	parent?: CountryGovDistMapItemBasic & { parent?: CountryGovDistMapItemBasic }
}

export interface GovDistFieldOpts {
	id: string
	tsKey: string
	tsNs: TsNS
	abbrev: null | string
	country: Country
	govDistType: GovDistType
	parentId: ParentID | null
	name: string
	slug: string
	iso: null | string
	countryId: CountryID
}

export interface Country {
	cca2: Cca2
}

export enum Cca2 {
	CA = 'CA',
	MX = 'MX',
	PR = 'PR',
	Us = 'US',
}

export enum CountryID {
	Ctry01GW2HHDK7PACTC9GJ2XBMVPKY = 'ctry_01GW2HHDK7PACTC9GJ2XBMVPKY',
	Ctry01GW2HHDK9M26M80SG63T21SVH = 'ctry_01GW2HHDK9M26M80SG63T21SVH',
	Ctry01GW2HHDKAWXWYHAAESAA5HH94 = 'ctry_01GW2HHDKAWXWYHAAESAA5HH94',
	Ctry01GW2HHDKB9DG2T2YZM5MFFVX9 = 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9',
}

export interface GovDistType {
	tsKey: TsKey
	tsNs: TsNS
}

export enum TsKey {
	TypeCity = 'type-city',
	TypeCounty = 'type-county',
	TypeDistrict = 'type-district',
	TypeProvince = 'type-province',
	TypeState = 'type-state',
	TypeTerritory = 'type-territory',
}

export enum TsNS {
	GovDist = 'gov-dist',
}

export enum ParentID {
	Gdst01GW2HHY0735M7CQSXR31HP114 = 'gdst_01GW2HHY0735M7CQSXR31HP114',
	Gdst01GW2HHZ3C061BT60QBAD8WVJZ = 'gdst_01GW2HHZ3C061BT60QBAD8WVJZ',
	Gdst01GW2HJ0MERT6FW07XV7PZWZWE = 'gdst_01GW2HJ0MERT6FW07XV7PZWZWE',
	Gdst01GW2HJ1D3W61ZMBGY0FGKY9EC = 'gdst_01GW2HJ1D3W61ZMBGY0FGKY9EC',
	Gdst01GW2HJ23GMD17FBJMJWD16PZ1 = 'gdst_01GW2HJ23GMD17FBJMJWD16PZ1',
	Gdst01GW2HJ35FAMD0V0YSSPYPMG46 = 'gdst_01GW2HJ35FAMD0V0YSSPYPMG46',
	Gdst01GW2HJ48BS27DYW8W4GNH4P2W = 'gdst_01GW2HJ48BS27DYW8W4GNH4P2W',
	Gdst01GW2HJ4XTJT4GBEWDBY057B01 = 'gdst_01GW2HJ4XTJT4GBEWDBY057B01',
	Gdst01GW2HJ5A278S2G84AB3N9FCW0 = 'gdst_01GW2HJ5A278S2G84AB3N9FCW0',
	Gdst01GW2HJ5XJRY6B6JNVZ8G8NFJY = 'gdst_01GW2HJ5XJRY6B6JNVZ8G8NFJY',
	Gdst01GW2HJ6WC0EDHHCHG998QT3N0 = 'gdst_01GW2HJ6WC0EDHHCHG998QT3N0',
	Gdst01GW2HJ7VX37RF69KKXAYE05QN = 'gdst_01GW2HJ7VX37RF69KKXAYE05QN',
	Gdst01GW2HJ8HJJWY8F1GKEM5R8QZ4 = 'gdst_01GW2HJ8HJJWY8F1GKEM5R8QZ4',
	Gdst01GW2HJ9GVN301XN2SKRWE8Q3M = 'gdst_01GW2HJ9GVN301XN2SKRWE8Q3M',
	Gdst01GW2HJAD7VVT46D0BHXQRV2WF = 'gdst_01GW2HJAD7VVT46D0BHXQRV2WF',
	Gdst01GW2HJC4WJWMZA8VDNVVE5RZQ = 'gdst_01GW2HJC4WJWMZA8VDNVVE5RZQ',
	Gdst01GW2HJDE344VFWCSNBYYSFDDW = 'gdst_01GW2HJDE344VFWCSNBYYSFDDW',
	Gdst01GW2HJF2WCKZ47HGSYQFANCDZ = 'gdst_01GW2HJF2WCKZ47HGSYQFANCDZ',
	Gdst01GW2HJG2676AX4NRXHWA4PB8B = 'gdst_01GW2HJG2676AX4NRXHWA4PB8B',
	Gdst01GW2HJH13NCXACKZGG242PM97 = 'gdst_01GW2HJH13NCXACKZGG242PM97',
	Gdst01GW2HJHQBKA67H0WWG35J4PV7 = 'gdst_01GW2HJHQBKA67H0WWG35J4PV7',
	Gdst01GW2HJJGA979WFBS7S7ECK0JK = 'gdst_01GW2HJJGA979WFBS7S7ECK0JK',
	Gdst01GW2HJK994XZPC3KNCPVST015 = 'gdst_01GW2HJK994XZPC3KNCPVST015',
	Gdst01GW2HJMBQGM1ZDVR1TJX4N6DY = 'gdst_01GW2HJMBQGM1ZDVR1TJX4N6DY',
	Gdst01GW2HJMYCBT3EWB9XCX2VSMK9 = 'gdst_01GW2HJMYCBT3EWB9XCX2VSMK9',
	Gdst01GW2HJPZYX059W3SHQW8D9F7M = 'gdst_01GW2HJPZYX059W3SHQW8D9F7M',
	Gdst01GW2HJQZ5J517QW02C84M80WD = 'gdst_01GW2HJQZ5J517QW02C84M80WD',
	Gdst01GW2HJRVH0VX93NDHEJ0QK158 = 'gdst_01GW2HJRVH0VX93NDHEJ0QK158',
	Gdst01GW2HJSQZ19Y230FJHNKHSW89 = 'gdst_01GW2HJSQZ19Y230FJHNKHSW89',
	Gdst01GW2HJTSK0AMAVYF9QD9GXBAR = 'gdst_01GW2HJTSK0AMAVYF9QD9GXBAR',
	Gdst01GW2HJVFHMQEZZ1AKH9QETVP6 = 'gdst_01GW2HJVFHMQEZZ1AKH9QETVP6',
	Gdst01GW2HJW29RXPB0ZW6ZTTPH7DY = 'gdst_01GW2HJW29RXPB0ZW6ZTTPH7DY',
	Gdst01GW2HJXH936VB5WWAHK8S8X0A = 'gdst_01GW2HJXH936VB5WWAHK8S8X0A',
	Gdst01GW2HJY7KQKE8XCP6BM8WC459 = 'gdst_01GW2HJY7KQKE8XCP6BM8WC459',
	Gdst01GW2HJZG4VMQ7QWQ3MHXG3S8K = 'gdst_01GW2HJZG4VMQ7QWQ3MHXG3S8K',
	Gdst01GW2HK0N4V9YBGBSQVN4JRKKW = 'gdst_01GW2HK0N4V9YBGBSQVN4JRKKW',
	Gdst01GW2HK1MBAAXAR655YEESJRB1 = 'gdst_01GW2HK1MBAAXAR655YEESJRB1',
	Gdst01GW2HK2PW0GCZATZ6YX9RG8FE = 'gdst_01GW2HK2PW0GCZATZ6YX9RG8FE',
	Gdst01GW2HK3G7JGSCMVRQERYCRQGY = 'gdst_01GW2HK3G7JGSCMVRQERYCRQGY',
	Gdst01GW2HK49A5XQ8ZDFKQSF098SJ = 'gdst_01GW2HK49A5XQ8ZDFKQSF098SJ',
	Gdst01GW2HK51XDFN3Q0ND2NCGBN14 = 'gdst_01GW2HK51XDFN3Q0ND2NCGBN14',
	Gdst01GW2HK5R9S8ZRWG9Z3BPFAXND = 'gdst_01GW2HK5R9S8ZRWG9Z3BPFAXND',
	Gdst01GW2HK6H7B5T82KZ82DZSFNR0 = 'gdst_01GW2HK6H7B5T82KZ82DZSFNR0',
	Gdst01GW2HK7G3WV9NP68CJ02WPMV7 = 'gdst_01GW2HK7G3WV9NP68CJ02WPMV7',
	Gdst01GW2HK8W4ZDJSZDPWZH2XH023 = 'gdst_01GW2HK8W4ZDJSZDPWZH2XH023',
	Gdst01GW2HK9J2HNR9ZCJJHF8WAGDT = 'gdst_01GW2HK9J2HNR9ZCJJHF8WAGDT',
	Gdst01GW2HKADSS3SDS9XJV1WHMTVY = 'gdst_01GW2HKADSS3SDS9XJV1WHMTVY',
	Gdst01GW2HKC6JBVM1S4P89T664V0A = 'gdst_01GW2HKC6JBVM1S4P89T664V0A',
	Gdst01GW2HKD240CAP65TPYPT32MRR = 'gdst_01GW2HKD240CAP65TPYPT32MRR',
	Gdst01GW2HKDJ5VV91D7JP3V6DE3DK = 'gdst_01GW2HKDJ5VV91D7JP3V6DE3DK',
	Gdst01GW2HKEDZ2K9QXJ96SKR44EGV = 'gdst_01GW2HKEDZ2K9QXJ96SKR44EGV',
}
