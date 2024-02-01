import { defineRouter, importHandler, permissionedProcedure, publicProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'orgHours'

const namespaced = (s: string) => `${NAMESPACE}.${s}`

export const orgHoursRouter = defineRouter({
	create: permissionedProcedure('createNewHours')
		.input(schema.ZCreateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('create'), () => import('./mutation.create.handler'))
			return handler(opts)
		}),
	createMany: permissionedProcedure('createNewHours')
		.input(schema.ZCreateManySchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('createMany'),
				() => import('./mutation.createMany.handler')
			)
			return handler(opts)
		}),
	update: permissionedProcedure('updateHours')
		.input(schema.ZUpdateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('update'), () => import('./mutation.update.handler'))
			return handler(opts)
		}),
	processDrawer: permissionedProcedure('updateHours')
		.input(schema.ZProcessDrawerSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(
				namespaced('processDrawer'),
				() => import('./mutation.processDrawer.handler')
			)
			return handler(opts)
		}),
	getTz: publicProcedure.input(schema.ZGetTzSchema).query(async (opts) => {
		const handler = await importHandler(namespaced('getTz'), () => import('./query.getTz.handler'))
		return handler(opts)
	}),
	forHoursDisplay: publicProcedure.input(schema.ZForHoursDisplaySchema).query(async (opts) => {
		const handler = await importHandler(
			namespaced('forHoursDisplay'),
			() => import('./query.forHoursDisplay.handler')
		)
		return handler(opts)
	}),
	forHoursDrawer: publicProcedure
		// permissionedProcedure('updateHours')
		.input(schema.ZForHoursDrawerSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('forHoursDrawer'),
				() => import('./query.forHoursDrawer.handler')
			)
			return handler(opts)
		}),
})
