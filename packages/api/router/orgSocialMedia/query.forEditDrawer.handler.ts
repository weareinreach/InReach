import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForEditDrawerSchema } from './query.forEditDrawer.schema'

export const forEditDrawer = async ({ ctx, input }: TRPCHandlerParams<TForEditDrawerSchema>) => {
	try {
		const result = await prisma.orgSocialMedia.findUnique({
			where: input,
			select: {
				id: true,
				username: true,
				url: true,
				deleted: true,
				published: true,
				serviceId: true,
				organizationId: true,
				orgLocationId: true,
				orgLocationOnly: true,
				service: {
					select: { id: true, name: true, logoIcon: true },
				},
			},
		})
		if (!result) return null
		return result
	} catch (error) {
		handleError(error)
	}
}
