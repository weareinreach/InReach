import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { isPublic } from '~api/schemas/selects/common'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForLocationPageSchema } from './query.forLocationPage.schema'

export const forLocationPage = async ({ input }: TRPCHandlerParams<TForLocationPageSchema>) => {
	try {
		const { slug } = input
		const org = await prisma.organization.findUniqueOrThrow({
			where: {
				slug,
				...isPublic,
			},
			select: {
				id: true,
				name: true,
				slug: true,
				published: true,
				lastVerified: true,
				allowedEditors: { where: { authorized: true }, select: { userId: true } },
			},
		})
		const { allowedEditors, ...orgData } = org
		const reformatted = {
			...orgData,
			isClaimed: Boolean(allowedEditors.length),
		}

		return reformatted
	} catch (error) {
		handleError(error)
	}
}
