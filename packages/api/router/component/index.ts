import { defineRouter, importHandler, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'component'

const namespaced = (s: string) => `${NAMESPACE}.${s}`

export const componentRouter = defineRouter({
	serviceModal: publicProcedure.input(schema.ZServiceModalSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('serviceModal'),
			() => import('./query.serviceModal.handler')
		)
		return handler(opts)
	}),
})
