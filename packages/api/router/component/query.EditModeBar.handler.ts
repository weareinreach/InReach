import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TEditModeBarSchema } from './query.EditModeBar.schema'

export const EditModeBar = async ({ input }: TRPCHandlerParams<TEditModeBarSchema>) => {
	try {
		const { orgLocationId, orgServiceId, slug } = input

		switch (true) {
			case !!slug: {
				const result = await prisma.organization.findUniqueOrThrow({
					where: { slug },
					select: { published: true, deleted: true, lastVerified: true },
				})
				return result
			}
			case !!orgServiceId: {
				const result = await prisma.orgService.findUniqueOrThrow({
					where: { id: orgServiceId },
					select: { published: true, deleted: true },
				})
				return { ...result, lastVerified: null }
			}
			case !!orgLocationId: {
				const result = await prisma.orgLocation.findUniqueOrThrow({
					where: { id: orgLocationId },
					select: { published: true, deleted: true },
				})
				return { ...result, lastVerified: null }
			}
			default: {
				throw new Error('Invalid input')
			}
		}
	} catch (error) {
		return handleError(error)
	}
}
export default EditModeBar
