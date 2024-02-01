import { defineRouter, importHandler, staffProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const NAMESPACE = 'internalNote'

const namespaced = (s: string) => `${NAMESPACE}.${s}`
export const internalNoteRouter = defineRouter({
	byId: staffProcedure
		.meta({ hasPerm: 'internalNotesRead' })
		.input(schema.ZByIdSchema)
		.query(async (opts) => {
			const handler = await importHandler(namespaced('byId'), () => import('./query.byId.handler'))
			return handler(opts)
		}),
	getAllForRecord: staffProcedure
		.meta({ hasPerm: 'internalNotesRead' })
		.input(schema.ZGetAllForRecordSchema)
		.query(async (opts) => {
			const handler = await importHandler(
				namespaced('getAllForRecord'),
				() => import('./query.getAllForRecord.handler')
			)
			return handler(opts)
		}),

	create: staffProcedure
		.meta({ hasPerm: 'internalNotesWrite' })
		.input(schema.ZCreateSchema)
		.mutation(async (opts) => {
			const handler = await importHandler(namespaced('create'), () => import('./mutation.create.handler'))
			return handler(opts)
		}),
})
