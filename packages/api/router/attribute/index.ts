import { defineRouter, importHandler, publicProcedure, staffProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'attribute'

const namespaced = (s: string) => `${NAMESPACE}.${s}`

export const attributeRouter = defineRouter({
	getFilterOptions: publicProcedure.query(async () => {
		const handler = await importHandler(
			namespaced('getFilterOptions'),
			() => import('./query.getFilterOptions.handler')
		)
		return handler()
	}),
	getOne: staffProcedure.input(schema.ZGetOneSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('getOne'), () => import('./query.getOne.handler'))
		return handler(opts)
	}),
	map: publicProcedure.query(async (opts) => {
		const handler = await importHandler(namespaced('all'), () => import('./query.map.handler'))
		return handler(opts)
	}),
})
