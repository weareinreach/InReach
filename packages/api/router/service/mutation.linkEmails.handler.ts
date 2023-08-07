import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TLinkEmailsSchema, ZLinkEmailsSchema } from './mutation.linkEmails.schema'

export const linkEmails = async ({ ctx, input }: TRPCHandlerParams<TLinkEmailsSchema, 'protected'>) => {
	try {
		const inputData = {
			actorId: ctx.actorId,
			operation: 'CREATE',
			data: input,
		}
		const { auditLog, orgServiceEmail } = ZLinkEmailsSchema().dataParser.parse(inputData)
		const result = await prisma.$transaction(async (tx) => {
			const links = await tx.orgServiceEmail.createMany({ data: orgServiceEmail, skipDuplicates: true })
			const logs = await tx.auditLog.createMany({ data: auditLog, skipDuplicates: true })
			return { orgServiceEmail: links.count, auditLog: logs.count }
		})
		return result
	} catch (error) {
		handleError(error)
	}
}
