import { defineRouter, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const HandlerCache: Partial<FieldOptHandlerCache> = {}

type FieldOptHandlerCache = {
	govDistsByCountry: typeof import('./query.govDistsByCountry.handler').govDistsByCountry
	govDistsByCountryNoSub: typeof import('./query.govDistsByCountryNoSub.handler').govDistsByCountryNoSub
	phoneTypes: typeof import('./query.phoneTypes.handler').phoneTypes
	attributesByCategory: typeof import('./query.attributesByCategory.handler').attributesByCategory
	attributeCategories: typeof import('./query.attributeCategories.handler').attributeCategories
	languages: typeof import('./query.languages.handler').languages
	countries: typeof import('./query.countries.handler').countries
	userTitle: typeof import('./query.userTitle.handler').userTitle
	countryGovDistMap: typeof import('./query.countryGovDistMap.handler').countryGovDistMap
}
export const fieldOptRouter = defineRouter({
	/** All government districts by country (active for org listings). Gives up to 2 levels of sub-districts */
	govDistsByCountry: publicProcedure
		.meta({
			description:
				'All government districts by country (active for org listings). Gives 2 levels of sub-districts',
		})
		.input(schema.ZGovDistsByCountrySchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.govDistsByCountry)
				HandlerCache.govDistsByCountry = await import('./query.govDistsByCountry.handler').then(
					(mod) => mod.govDistsByCountry
				)
			if (!HandlerCache.govDistsByCountry) throw new Error('Failed to load handler')
			return HandlerCache.govDistsByCountry({ ctx, input })
		}),
	govDistsByCountryNoSub: publicProcedure
		.meta({
			description: 'All government districts by country (active for org listings).',
		})
		.input(schema.ZGovDistsByCountryNoSubSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.govDistsByCountryNoSub)
				HandlerCache.govDistsByCountryNoSub = await import('./query.govDistsByCountryNoSub.handler').then(
					(mod) => mod.govDistsByCountryNoSub
				)
			if (!HandlerCache.govDistsByCountryNoSub) throw new Error('Failed to load handler')
			return HandlerCache.govDistsByCountryNoSub({ ctx, input })
		}),
	phoneTypes: publicProcedure.query(async () => {
		if (!HandlerCache.phoneTypes)
			HandlerCache.phoneTypes = await import('./query.phoneTypes.handler').then((mod) => mod.phoneTypes)
		if (!HandlerCache.phoneTypes) throw new Error('Failed to load handler')
		return HandlerCache.phoneTypes()
	}),
	attributesByCategory: publicProcedure
		.input(schema.ZAttributesByCategorySchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.attributesByCategory)
				HandlerCache.attributesByCategory = await import('./query.attributesByCategory.handler').then(
					(mod) => mod.attributesByCategory
				)
			if (!HandlerCache.attributesByCategory) throw new Error('Failed to load handler')
			return HandlerCache.attributesByCategory({ ctx, input })
		}),
	attributeCategories: publicProcedure
		.input(schema.ZAttributeCategoriesSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.attributeCategories)
				HandlerCache.attributeCategories = await import('./query.attributeCategories.handler').then(
					(mod) => mod.attributeCategories
				)
			if (!HandlerCache.attributeCategories) throw new Error('Failed to load handler')
			return HandlerCache.attributeCategories({ ctx, input })
		}),
	languages: publicProcedure.input(schema.ZLanguagesSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.languages)
			HandlerCache.languages = await import('./query.languages.handler').then((mod) => mod.languages)
		if (!HandlerCache.languages) throw new Error('Failed to load handler')
		return HandlerCache.languages({ ctx, input })
	}),
	countries: publicProcedure.input(schema.ZCountriesSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.countries)
			HandlerCache.countries = await import('./query.countries.handler').then((mod) => mod.countries)
		if (!HandlerCache.countries) throw new Error('Failed to load handler')
		return HandlerCache.countries({ ctx, input })
	}),
	userTitle: publicProcedure.query(async () => {
		if (!HandlerCache.userTitle)
			HandlerCache.userTitle = await import('./query.userTitle.handler').then((mod) => mod.userTitle)
		if (!HandlerCache.userTitle) throw new Error('Failed to load handler')
		return HandlerCache.userTitle()
	}),
	countryGovDistMap: publicProcedure.query(async ({ ctx }) => {
		if (!HandlerCache.countryGovDistMap)
			HandlerCache.countryGovDistMap = await import('./query.countryGovDistMap.handler').then(
				(mod) => mod.countryGovDistMap
			)
		if (!HandlerCache.countryGovDistMap) throw new Error('Failed to load handler')
		return HandlerCache.countryGovDistMap()
	}),
})
