/* eslint-disable @typescript-eslint/consistent-type-imports */

import { defineRouter, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import { permissionSubRouter } from './permission'
import * as schema from './schemas'
// import { userRoleSubRouter } from './role'

type SystemHandlerCache = {
	getFeatureFlag: typeof import('./query.getFeatureFlag.handler').getFeatureFlag
	updateInactiveCountryEdgeConfig: typeof import('./mutation.updateInactiveCountryEdgeConfig.handler').updateInactiveCountryEdgeConfig
}

const HandlerCache: Partial<SystemHandlerCache> = {}
export const systemRouter = defineRouter({
	// permissions: permissionSubRouter,
	updateInactiveCountryEdgeConfig: permissionedProcedure('attachOrgAttributes').mutation(async () => {
		if (!HandlerCache.updateInactiveCountryEdgeConfig)
			HandlerCache.updateInactiveCountryEdgeConfig = await import(
				'./mutation.updateInactiveCountryEdgeConfig.handler'
			).then((mod) => mod.updateInactiveCountryEdgeConfig)
		if (!HandlerCache.updateInactiveCountryEdgeConfig) throw new Error('Failed to load handler')
		return HandlerCache.updateInactiveCountryEdgeConfig()
	}),
	getFeatureFlag: publicProcedure.input(schema.ZGetFeatureFlagSchema).query(async ({ input, ctx }) => {
		if (!HandlerCache.getFeatureFlag)
			HandlerCache.getFeatureFlag = await import('./query.getFeatureFlag.handler').then(
				(mod) => mod.getFeatureFlag
			)
		if (!HandlerCache.getFeatureFlag) throw new Error('Failed to load handler')
		return HandlerCache.getFeatureFlag({ ctx, input })
	}),
	// userRoles: userRoleSubRouter,
})
