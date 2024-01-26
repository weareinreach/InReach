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
				description: { select: { tsKey: { select: { key: true, text: true, ns: true } } } },
				services: { select: { tag: { select: { id: true, tsKey: true, tsNs: true } } } },
			},
		})
		if (!result) return null
		const { serviceName, description, services, ...rest } = result
		return {
			name: serviceName?.tsKey,
			description: description?.tsKey,
			services: services?.map((service) => ({ ...service.tag, variant: 'service' as const })),
			...rest,
		}
	} catch (error) {
		handleError(error)
	}
}
export default serviceEdit
