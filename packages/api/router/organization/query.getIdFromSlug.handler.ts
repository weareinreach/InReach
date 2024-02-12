import { checkPermissions } from '@weareinreach/auth'
import { prisma } from '@weareinreach/db'
import { readSlugCache, writeSlugCache } from '~api/cache/slugToOrgId'
import { isPublic } from '~api/schemas/selects/common'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetIdFromSlugSchema } from './query.getIdFromSlug.schema'

export const getIdFromSlug = async ({ ctx, input }: TRPCHandlerParams<TGetIdFromSlugSchema>) => {
	const { slug } = input
	const cachedId = await readSlugCache(slug)
	if (cachedId) return { id: cachedId }
	const canSeeUnpublished =
		ctx.session !== null &&
		checkPermissions({
			session: ctx.session,
			permissions: ['dataPortalBasic', 'dataPortalAdmin', 'dataPortalManager'],
			has: 'some',
		})
	const orgId = await prisma.organization.findUniqueOrThrow({
		where: { slug, ...(canSeeUnpublished ? {} : isPublic) },
		select: { id: true, published: true, deleted: true },
	})
	if (orgId.published && !orgId.deleted) {
		await writeSlugCache(slug, orgId.id)
	}
	return { id: orgId.id }
}
export default getIdFromSlug
