import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

const update = async ({ ctx, input }: TRPCHandlerParams<TUpdateSchema, 'dataPortalManager'>) => {
	const { id, status, internalNotes } = input

	return await prisma.$transaction(async (tx) => {
		const updatedReport = await tx.report.update({
			where: { id },
			data: {
				status,
				handledBy: {
					connect: { id: ctx.actorId },
				},
			},
		})

		if (internalNotes) {
			await tx.internalNote.create({
				data: {
					text: internalNotes.trim(),
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
