import slugify from 'slugify'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGenerateSlugSchema } from './query.generateSlug.schema'

const uniqueSlug = async (name: string, inc?: number): Promise<string> => {
	try {
		const check = async (slug: string) => {
			// Only a PUBLISHED org's slug counts as "taken" here - this is a public, unauthenticated endpoint,
			// so treating an unpublished org's slug as unavailable would reveal that it exists (the suggested
			// slug would come back with a "-1" suffix with no visible reason why). If an unpublished org
			// secretly already holds this exact slug, the real creation-time check (generateUniqueSlug,
			// called server-side when the org actually gets created) still catches the real conflict and falls
			// back to an id-suffixed slug - this only affects what the live preview suggests, not what slug an
			// org can actually end up with.
			const existing = await prisma.organization.findUnique({
				where: {
					slug,
					published: true,
				},
				select: {
					slug: true,
				},
			})
			return !existing?.slug
		}
		const generatedSlug = slugify(inc ? `${name} ${inc}` : name, { lower: true, strict: true, trim: true })
		const isUnique = await check(generatedSlug)
		if (isUnique) {
			return generatedSlug
		} else {
			return await uniqueSlug(name, (inc ?? 0) + 1)
		}
	} catch (error) {
		console.error(error)
		throw error
	}
}

const generateSlug = async ({ input }: TRPCHandlerParams<TGenerateSlugSchema>) => {
	const slug = await uniqueSlug(input)
	return slug
}
export default generateSlug
