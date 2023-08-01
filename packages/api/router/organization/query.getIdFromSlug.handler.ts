import { prisma } from '@weareinreach/db'
import { readSlugCache, writeSlugCache } from '~api/cache/slugToOrgId'
import { handleError } from '~api/lib/errorHandler'
import { isPublic } from '~api/schemas/selects/common'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetIdFromSlugSchema } from './query.getIdFromSlug.schema'

export const getIdFromSlug = async ({ ctx, input }: TRPCHandlerParams<TGetIdFromSlugSchema>) => {
	try {
		const { slug } = input
		const cachedId = await readSlugCache(slug)
		if (cachedId) return { id: cachedId }
		const orgId = await prisma.organization.findUniqueOrThrow({
			where: { slug, ...isPublic },
			select: { id: true },
		})
		await writeSlugCache(slug, orgId.id)
		return orgId
	} catch (error) {
		handleError(error)
	}
}
