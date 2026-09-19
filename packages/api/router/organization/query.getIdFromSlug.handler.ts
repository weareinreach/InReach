import { TRPCError } from '@trpc/server'

import { checkPermissions } from '@weareinreach/auth'
import { prisma } from '@weareinreach/db'
import { readSlugCache, writeSlugCache } from '~api/cache/slugToOrgId'
import { handleError } from '~api/lib/errorHandler'
import { isPublic } from '~api/schemas/selects/common'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetIdFromSlugSchema } from './query.getIdFromSlug.schema'

const getIdFromSlug = async ({ ctx, input }: TRPCHandlerParams<TGetIdFromSlugSchema>) => {
	try {
		const { slug } = input
		const cachedId = await readSlugCache(slug)
		if (cachedId) {
			return { id: cachedId }
		}
		const canSeeUnpublished =
			ctx.session !== null &&
			checkPermissions({
				session: ctx.session,
				permissions: ['dataPortalBasic', 'dataPortalAdmin', 'dataPortalManager'],
				has: 'some',
			})
		const org = await prisma.organization.findUnique({
			where: { slug, ...(canSeeUnpublished ? {} : isPublic) },
			select: { id: true, published: true, deleted: true },
		})
		if (org) {
			if (org.published && !org.deleted) {
				await writeSlugCache(slug, org.id)
			}
			return { id: org.id }
		}
		// Renaming an org regenerates its slug (mutation.updateBasic.handler.ts) and records the old
		// one here - without this fallback, any bookmarked/cached link using the old slug hard-crashes
		// with a raw "record not found" instead of resolving to the org's current slug (confirmed live).
		const redirect = await prisma.slugRedirect.findUnique({
			where: { from: slug },
			select: { orgId: true, to: true },
		})
		if (redirect) {
			return { id: redirect.orgId, redirectedTo: redirect.to }
		}
		throw new TRPCError({ code: 'NOT_FOUND', message: `No organization found for slug "${slug}"` })
	} catch (err) {
		return handleError(err)
	}
}
export default getIdFromSlug
