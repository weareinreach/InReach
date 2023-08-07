import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TLinkPhonesSchema, ZLinkPhonesSchema } from './mutation.linkPhones.schema'

export const linkPhones = async ({ ctx, input }: TRPCHandlerParams<TLinkPhonesSchema, 'protected'>) => {
	try {
		const inputData = {
			actorId: ctx.actorId,
			operation: 'CREATE',
			data: input,
		}
		const { auditLog, orgServicePhone } = ZLinkPhonesSchema().dataParser.parse(inputData)
		const result = await prisma.$transaction(async (tx) => {
			const links = await tx.orgServicePhone.createMany({ data: orgServicePhone, skipDuplicates: true })
			const logs = await tx.auditLog.createMany({ data: auditLog, skipDuplicates: true })
			return { orgServicePhone: links.count, auditLog: logs.count }
		})
		return result
	} catch (error) {
		handleError(error)
	}
}
