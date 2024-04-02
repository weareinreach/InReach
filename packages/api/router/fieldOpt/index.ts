import { defineRouter, importHandler, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'fieldOpt'

const namespaced = (s: string) => `${NAMESPACE}.${s}`
export const fieldOptRouter = defineRouter({
	/** All government districts by country (active for org listings). Gives up to 2 levels of sub-districts */
	govDistsByCountry: publicProcedure
		.meta({
			description:
				'All government districts by country (active for org listings). Gives 2 levels of sub-districts',
		})
		.input(schema.ZGovDistsByCountrySchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('govDistsByCountry'),
				() => import('./query.govDistsByCountry.handler')
			)
			return handler(opts)
		}),
	govDistsByCountryNoSub: publicProcedure
		.meta({
			description: 'All government districts by country (active for org listings).',
		})
		.input(schema.ZGovDistsByCountryNoSubSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('govDistsByCountryNoSub'),
				() => import('./query.govDistsByCountryNoSub.handler')
			)
			return handler(opts)
		}),
	phoneTypes: publicProcedure.query(async () => {
		const handler = await importHandler(namespaced('phoneTypes'), () => import('./query.phoneTypes.handler'))
		return handler()
	}),
	attributesByCategory: publicProcedure.input(schema.ZAttributesByCategorySchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('attributesByCategory'),
			() => import('./query.attributesByCategory.handler')
		)
		return handler(opts)
	}),
	attributeCategories: publicProcedure.input(schema.ZAttributeCategoriesSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('attributeCategories'),
			() => import('./query.attributeCategories.handler')
		)
		return handler(opts)
	}),
	languages: publicProcedure.input(schema.ZLanguagesSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('languages'), () => import('./query.languages.handler'))
		return handler(opts)
	}),
	countries: publicProcedure.input(schema.ZCountriesSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('countries'), () => import('./query.countries.handler'))
		return handler(opts)
	}),
	userTitle: publicProcedure.query(async () => {
		const handler = await importHandler(namespaced('userTitle'), () => import('./query.userTitle.handler'))
		return handler()
	}),
	countryGovDistMap: publicProcedure.query(async () => {
		const handler = await importHandler(
			namespaced('countryGovDistMap'),
			() => import('./query.countryGovDistMap.handler')
		)
		return handler()
	}),
	getSubDistricts: publicProcedure.input(schema.ZGetSubDistrictsSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('getSubDistricts'),
			() => import('./query.getSubDistricts.handler')
		)
		return handler(opts)
	}),
	govDists: publicProcedure.input(schema.ZGovDistsSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('govDists'), () => import('./query.govDists.handler'))
		return handler(opts)
	}),
	orgBadges: publicProcedure.input(schema.ZOrgBadgesSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('orgBadges'), () => import('./query.orgBadges.handler'))
		return handler(opts)
	}),
	ccaMap: publicProcedure.input(schema.ZCcaMapSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('ccaMap'), () => import('./query.ccaMap.handler'))
		return handler(opts)
	}),
})
