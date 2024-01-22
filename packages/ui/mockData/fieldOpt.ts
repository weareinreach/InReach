import { z } from 'zod'

import { type ApiOutput } from '@weareinreach/api'
import { getTRPCMock, type MockAPIHandler, type MockHandlerObject } from '~ui/lib/getTrpcMock'

const queryAttributeCategories: MockAPIHandler<'fieldOpt', 'attributeCategories'> = async (query) => {
	const attributeCategories = (await import('./json/fieldOpt.attributeCategories.json')).default
	if (Array.isArray(query)) {
		return attributeCategories.filter(({ tag }) => query.includes(tag))
	}
	return attributeCategories
}

const queryAttributesByCategory: MockAPIHandler<'fieldOpt', 'attributesByCategory'> = async (query) => {
	const attributesByCategory = (await import('./json/fieldOpt.attributesByCategory.json')).default
	if (typeof query === 'string' || Array.isArray(query)) {
		return attributesByCategory.filter(({ categoryName }) =>
			Array.isArray(query) ? query.includes(categoryName) : query === categoryName
		) as ApiOutput['fieldOpt']['attributesByCategory']
	}
	return attributesByCategory as ApiOutput['fieldOpt']['attributesByCategory']
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
	if (query) return govDistsByCountry.filter(({ cca2 }) => cca2 === query)
	return govDistsByCountry
}

const queryGovDistsByCountryNoSub: MockAPIHandler<'fieldOpt', 'govDistsByCountryNoSub'> = async (query) => {
	const govDistByCountryNoSub = (await import('./json/fieldOpt.govDistsByCountryNoSub.json')).default
	if (query) return govDistByCountryNoSub.filter(({ cca2 }) => cca2 === query)
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
	const countryGovDistMapData = (await import('./json/fieldOpt.countryGovDistMap.json')).default
	return new Map<string, CountryGovDistMapItem>(countryGovDistMapSchema.parse(countryGovDistMapData))
}
const getSubDistricts: MockAPIHandler<'fieldOpt', 'getSubDistricts'> = async (id) => {
	const data = (await import('./json/fieldOpt.getSubDistricts.json')).default
	const filtered = data.filter(({ parentId }) => parentId === id)
	const formatted = filtered.map(({ parentId, ...data }) => data)
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
			const data = (await import('./json/fieldOpt.govDists.json')).default

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
				const formatted = filtered.map(({ parentId, ...data }) => data)
				return formatted
			}
			const formatted = data.map(({ parentId, ...data }) => data)
			return formatted
		},
	}),
	getLeaderBadges: getTRPCMock({
		path: ['fieldOpt', 'getLeaderBadges'],
		response: async () => {
			const { default: data } = await import('./json/fieldOpt.getLeaderBadges.json')
			return data
		},
	}),
	getServFocusBadges: getTRPCMock({
		path: ['fieldOpt', 'getServFocusBadges'],
		response: async () => {
			const { default: data } = await import('./json/fieldOpt.getServFocusBadges.json')
			return data
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
