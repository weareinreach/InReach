import slugify from 'slugify'

import { type Context } from '~api/lib/context'

export const uniqueSlug = async (ctx: Context, name: string, inc?: number): Promise<string> => {
	try {
		const check = async (slug: string) => {
			const existing = await ctx.prisma.organization.findUnique({
				where: {
					slug,
				},
				select: {
					slug: true,
				},
			})
			return !existing?.slug
		}
		const generatedSlug = slugify(inc ? `${name} ${inc}` : name, { lower: true, strict: true, trim: true })
		const isUnique = await check(generatedSlug)
		if (isUnique) return generatedSlug
		else return await uniqueSlug(ctx, name, (inc ?? 0) + 1)
	} catch (error) {
		console.error(error)
		throw error
	}
}
