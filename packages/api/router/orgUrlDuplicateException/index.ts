import { defineRouter, importHandler, permissionedProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'orgUrlDuplicateException'

const namespaced = (s: string) => `${NAMESPACE}.${s}`

export const orgUrlDuplicateExceptionRouter = defineRouter({
	forTable: permissionedProcedure('viewOrgUrlDuplicateExceptions')
		.input(schema.ZForTableSchema)
		.query(async (opts) => {
			const handler = await importHandler(namespaced('forTable'), () => import('./query.forTable.handler'))
			return handler(opts)
		}),
	auditLog: permissionedProcedure('viewOrgUrlDuplicateExceptions')
		.input(schema.ZAuditLogSchema)
		.query(async (opts) => {
			const handler = await importHandler(namespaced('auditLog'), () => import('./query.auditLog.handler'))
			return handler(opts)
		}),
	create: permissionedProcedure('createOrgUrlDuplicateException')
		.input(schema.ZCreateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('create'), () => import('./mutation.create.handler'))
			return handler(opts)
		}),
	update: permissionedProcedure('updateOrgUrlDuplicateException')
		.input(schema.ZUpdateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('update'), () => import('./mutation.update.handler'))
			return handler(opts)
		}),
	delete: permissionedProcedure('deleteOrgUrlDuplicateException')
		.input(schema.ZDeleteSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('delete'), () => import('./mutation.delete.handler'))
			return handler(opts)
		}),
	unDelete: permissionedProcedure('deleteOrgUrlDuplicateException')
		.input(schema.ZUnDeleteSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('unDelete'), () => import('./mutation.unDelete.handler'))
			return handler(opts)
		}),
})
