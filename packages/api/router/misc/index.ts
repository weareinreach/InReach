import { defineRouter, importHandler, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'misc'

const namespaced = (s: string) => `${NAMESPACE}.${s}`
export const miscRouter = defineRouter({
	hasContactInfo: publicProcedure.input(schema.ZHasContactInfoSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('hasContactInfo'),
			() => import('./query.hasContactInfo.handler')
		)
		return handler(opts)
	}),
	getCountryTranslation: publicProcedure.input(schema.ZGetCountryTranslationSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('getCountryTranslation'),
			() => import('./query.getCountryTranslation.handler')
		)
		return handler(opts)
	}),
	forEditNavbar: permissionedProcedure('updateLocation')
		.input(schema.ZForEditNavbarSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('forEditNavbar'),
				() => import('./query.forEditNavbar.handler')
			)
			return handler(opts)
		}),
	revalidatePage: permissionedProcedure('createNewOrgQuick')
		.input(schema.ZRevalidatePageSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('revalidatePage'),
				() => import('./mutation.revalidatePage.handler')
			)
			return handler(opts)
		}),
})
