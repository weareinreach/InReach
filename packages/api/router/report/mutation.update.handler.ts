import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

const update = async ({ ctx, input }: TRPCHandlerParams<TUpdateSchema, 'protected'>) => {
	const { id, status, internalNotes, informed } = input

	return await prisma.$transaction(async (tx) => {
		const oldReport = await tx.report.findUnique({ where: { id }, select: { status: true } })

		const updatedReport = await tx.report.update({
			where: { id },
			data: {
				status,
				informed,
				handledBy: {
					connect: { id: ctx.actorId },
				},
			},
		})

		const statusChanged = oldReport && oldReport.status !== status
		if (internalNotes || statusChanged) {
			const noteText = internalNotes?.trim() || `Status updated to ${status}`
			await tx.internalNote.create({
				data: {
					text: noteText,
					organization: { connect: { id: updatedReport.organizationId } },
					report: { connect: { id: updatedReport.id } },
					user: { connect: { id: ctx.actorId } },
				},
			})
		}

		return updatedReport
	})
}

export default update
