import { isIdFor, prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForEditNavbarSchema } from './query.forEditNavbar.schema'

export const forEditNavbar = async ({ input }: TRPCHandlerParams<TForEditNavbarSchema>) => {
	try {
		if (input.slug) {
			const result = await prisma.organization.findUniqueOrThrow({
				where: { slug: input.slug },
				select: { published: true, deleted: true, lastVerified: true },
			})
			return result
		}
		const result = await prisma.orgLocation.findUniqueOrThrow({
			where: { id: input.orgLocationId },
			select: { published: true, deleted: true },
		})
		return { ...result, lastVerified: null }
	} catch (error) {
		handleError(error)
	}
}
