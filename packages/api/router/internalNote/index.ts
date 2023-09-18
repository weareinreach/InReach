import { defineRouter, staffProcedure } from '~api/lib/trpc'

import * as schema from './schemas'

const HandlerCache: Partial<InternalNoteHandlerCache> = {}

type InternalNoteHandlerCache = {
	byId: typeof import('./query.byId.handler').byId
	getAllForRecord: typeof import('./query.getAllForRecord.handler').getAllForRecord
	create: typeof import('./mutation.create.handler').create
}
export const internalNoteRouter = defineRouter({
	byId: staffProcedure
		.meta({ hasPerm: 'internalNotesRead' })
		.input(schema.ZByIdSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.byId) HandlerCache.byId = await import('./query.byId.handler').then((mod) => mod.byId)
			if (!HandlerCache.byId) throw new Error('Failed to load handler')
			return HandlerCache.byId({ ctx, input })
		}),
	getAllForRecord: staffProcedure
		.meta({ hasPerm: 'internalNotesRead' })
		.input(schema.ZGetAllForRecordSchema)
		.query(async ({ ctx, input }) => {
			if (!HandlerCache.getAllForRecord)
				HandlerCache.getAllForRecord = await import('./query.getAllForRecord.handler').then(
					(mod) => mod.getAllForRecord
				)
			if (!HandlerCache.getAllForRecord) throw new Error('Failed to load handler')
			return HandlerCache.getAllForRecord({ ctx, input })
		}),

	create: staffProcedure
		.meta({ hasPerm: 'internalNotesWrite' })
		.input(schema.ZCreateSchema().inputSchema)
		.mutation(async ({ ctx, input }) => {
			if (!HandlerCache.create)
				HandlerCache.create = await import('./mutation.create.handler').then((mod) => mod.create)
			if (!HandlerCache.create) throw new Error('Failed to load handler')
			return HandlerCache.create({ ctx, input })
		}),
})
