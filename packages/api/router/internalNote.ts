import { z } from 'zod'

import { defineRouter, staffProcedure } from '~api/lib/trpc'
import { GetNoteByRecord, CreateNote } from '~api/schemas/internalNote'

export const internalNoteRouter = defineRouter({
	byId: staffProcedure
		.meta({ hasPerm: 'internalNotesRead' })
		.input(z.string())
		.query(
			async ({ ctx, input }) => await ctx.prisma.internalNote.findFirstOrThrow({ where: { id: input } })
		),
	getAllForRecord: staffProcedure
		.meta({ hasPerm: 'internalNotesRead' })
		.input(GetNoteByRecord)
		.query(async ({ ctx, input }) => await ctx.prisma.internalNote.findMany({ where: input })),

	create: staffProcedure
		.meta({ hasPerm: 'internalNotesWrite' })
		.input(CreateNote().inputSchema)
		.mutation(async ({ ctx, input }) => {
			const inputData = {
				actorId: ctx.session.user.id,
				operation: 'CREATE',
				data: input,
			}
			const { internalNote, auditLog } = CreateNote().dataParser.parse(inputData)

			const results = await ctx.prisma.$transaction(async (tx) => {
				const note = await tx.internalNote.create(internalNote)
				const log = await tx.auditLog.create(auditLog)
				return { note, log }
			})
			return results.note.id
		}),
})
