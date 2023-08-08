import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

export const getProfile = async ({ ctx }: TRPCHandlerParams<undefined, 'protected'>) => {
	try {
		const profile = await prisma.user.findUniqueOrThrow({
			where: {
				id: ctx.session.user.id,
			},
			select: {
				id: true,
				createdAt: true,
				updatedAt: true,
				name: true,
				email: true,
				image: true,
				active: true,
			},
		})
		return profile
	} catch (error) {
		handleError(error)
	}
}
