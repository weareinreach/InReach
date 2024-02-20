import { defineRouter, importHandler, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'
// import { userRoleSubRouter } from './role'

const NAMESPACE = 'system'

const namespaced = (s: string) => `${NAMESPACE}.${s}`
export const systemRouter = defineRouter({
	// permissions: permissionSubRouter,
	updateInactiveCountryEdgeConfig: permissionedProcedure('attachOrgAttributes').mutation(async () => {
		const handler = await importHandler(
			namespaced('updateInactiveCountryEdgeConfig'),
			() => import('./mutation.updateInactiveCountryEdgeConfig.handler')
		)
		return handler()
	}),
	getFeatureFlag: publicProcedure.input(schema.ZGetFeatureFlagSchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('getFeatureFlag'),
			() => import('./query.getFeatureFlag.handler')
		)
		return handler(opts)
	}),
	auditLogByActorId: permissionedProcedure('viewUserReviews')
		.input(schema.ZAuditLogByActorIdSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('auditLogByActorId'),
				() => import('./query.auditLogByActorId.handler')
			)
			return handler(opts)
		}),
	auditLogByRecordId: permissionedProcedure('viewUserReviews')
		.input(schema.ZAuditLogByRecordIdSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('auditLogByRecordId'),
				() => import('./query.auditLogByRecordId.handler')
			)
			return handler(opts)
		}),
	// userRoles: userRoleSubRouter,
})
