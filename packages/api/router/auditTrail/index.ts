import { defineRouter, importHandler, staffProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'auditTrail'

const namespaced = (s: string) => `${NAMESPACE}.${s}`
export const auditTrailRouter = defineRouter({
	getAllForOrg: staffProcedure
		.meta({ hasPerm: 'internalNotesRead' })
		.input(schema.ZGetAllForOrgSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('getAllForOrg'),
				() => import('./query.getAllForOrg.handler')
			)
			return handler(opts)
		}),
})
