import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TServiceEditSchema } from './query.serviceEdit.schema'

export const serviceEdit = async ({ ctx, input }: TRPCHandlerParams<TServiceEditSchema>) => {
	try {
		const result = await prisma.orgService.findUnique({
			where: input,
			select: {
				id: true,
				deleted: true,
				published: true,
				createdAt: true,
				updatedAt: true,
				serviceName: { select: { tsKey: { select: { key: true, text: true, ns: true } } } },
			},
		})
		const { serviceName, ...rest } = result ?? {}
		return {
			name: serviceName?.tsKey,
			...rest,
		}
	} catch (error) {
		handleError(error)
	}
}
export default serviceEdit
