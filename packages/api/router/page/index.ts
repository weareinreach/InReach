import { defineRouter, importHandler, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'page'

const namespaced = (s: string) => `${NAMESPACE}.${s}`

export const pageRouter = defineRouter({
	serviceEdit: permissionedProcedure('createOrgService')
		.input(schema.ZServiceEditSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('serviceEdit'),
				() => import('./query.serviceEdit.handler')
			)
			return handler(opts)
		}),
})
