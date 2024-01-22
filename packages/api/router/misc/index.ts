import { defineRouter, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const HandlerCache: Partial<MiscHandlerCache> = {}

type MiscHandlerCache = {
	hasContactInfo: typeof import('./query.hasContactInfo.handler').hasContactInfo
	getCountryTranslation: typeof import('./query.getCountryTranslation.handler').getCountryTranslation
	forEditNavbar: typeof import('./query.forEditNavbar.handler').forEditNavbar
}

export const miscRouter = defineRouter({
	hasContactInfo: publicProcedure.input(schema.ZHasContactInfoSchema).query(async ({ ctx, input }) => {
		if (!HandlerCache.hasContactInfo)
			HandlerCache.hasContactInfo = await import('./query.hasContactInfo.handler').then(
				(mod) => mod.hasContactInfo
			)

		if (!HandlerCache.hasContactInfo) throw new Error('Failed to load handler')
		return HandlerCache.hasContactInfo({ ctx, input })
	}),
	getCountryTranslation: publicProcedure
		.input(schema.ZGetCountryTranslationSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.getCountryTranslation)
				HandlerCache.getCountryTranslation = await import('./query.getCountryTranslation.handler').then(
					(mod) => mod.getCountryTranslation
				)

			if (!HandlerCache.getCountryTranslation) throw new Error('Failed to load handler')
			return HandlerCache.getCountryTranslation({ ctx, input })
		}),
	forEditNavbar: permissionedProcedure('updateLocation')
		.input(schema.ZForEditNavbarSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.forEditNavbar)
				HandlerCache.forEditNavbar = await import('./query.forEditNavbar.handler').then(
					(mod) => mod.forEditNavbar
				)

			if (!HandlerCache.forEditNavbar) throw new Error('Failed to load handler')
			return HandlerCache.forEditNavbar({ ctx, input })
		}),
})
