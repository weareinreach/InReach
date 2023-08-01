/* eslint-disable @typescript-eslint/consistent-type-imports */
import superjson from 'superjson'

import { getEnv } from '@weareinreach/env'
import { handleError } from '~api/lib/errorHandler'
import { defineRouter, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import { permissionSubRouter } from './permission'
import * as schema from './schemas'
// import { userRoleSubRouter } from './role'

type SystemHandlerCache = {
	getFeatureFlag: typeof import('./query.getFeatureFlag.handler').getFeatureFlag
}

const HandlerCache: Partial<SystemHandlerCache> = {}
export const systemRouter = defineRouter({
	permissions: permissionSubRouter,
	updateInactiveCountryEdgeConfig: permissionedProcedure('attachOrgAttributes').mutation(async ({ ctx }) => {
		try {
			const active = await ctx.prisma.country.findMany({
				where: { activeForOrgs: true },
				select: { cca2: true },
				orderBy: { cca2: 'asc' },
			})
			const inactive = await ctx.prisma.country.findMany({
				where: { activeForOrgs: null },
				select: { cca2: true, tsKey: true },
				orderBy: { cca2: 'asc' },
			})
			const prefixed = await ctx.prisma.country.findMany({
				where: { articlePrefix: true },
				select: { cca2: true },
				orderBy: { cca2: 'asc' },
			})
			const updateEdgeConfig = await fetch(
				'https://api.vercel.com/v1/edge-config/ecfg_1sqfggbdhoelhs9pm6mlhv951pfu/items?teamId=team_7S6ZQ4FrzxNgd9QvlU8P73wc',
				{
					method: 'PATCH',
					headers: {
						Authorization: `Bearer ${getEnv('EDGE_CONFIG_TOKEN')}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						items: [
							{
								operation: 'upsert',
								key: 'inactiveCountries',
								value: superjson.serialize(new Map(inactive.map(({ cca2, tsKey }) => [cca2, tsKey]))),
							},
							{
								operation: 'upsert',
								key: 'activeCountries',
								value: active.map(({ cca2 }) => cca2),
							},
							{
								operation: 'upsert',
								key: 'prefixedCountries',
								value: prefixed.map(({ cca2 }) => cca2),
							},
						],
					}),
				}
			)
			const result = await updateEdgeConfig.json()
			return result
		} catch (error) {
			handleError(error)
		}
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
