import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAttachServiceTagsSchema, ZAttachServiceTagsSchema } from './mutation.attachServiceTags.schema'

export const attachServiceTags = async ({
	ctx,
	input,
}: TRPCHandlerParams<TAttachServiceTagsSchema, 'protected'>) => {
	try {
		const inputData = {
			actorId: ctx.actorId,
			operation: 'LINK',
			to: input,
		}
		const { auditLogs, orgServiceTag } = ZAttachServiceTagsSchema().dataParser.parse(inputData)
		const results = await prisma.$transaction(async (tx) => {
			const tags = await tx.orgServiceTag.createMany(orgServiceTag)
			const logs = await tx.auditLog.createMany(auditLogs)
			return { orgServiceTag: tags.count, auditLog: logs.count }
		})
		return results
	} catch (error) {
		handleError(error)
	}
}
