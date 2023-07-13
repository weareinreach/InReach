import slugify from 'slugify'

import { prisma } from '~db/client'

type SlugifyOptions = Parameters<typeof slugify>['1']

export const slug = (string: string, options: SlugifyOptions = { lower: true, strict: true, trim: true }) =>
	slugify(string, options)

const getSlugs = async () => {
	const activeSlugs = await prisma.organization.findMany({ select: { slug: true } })
	const redirectedSlugs = await prisma.slugRedirect.findMany({ select: { from: true, to: true } })
	return new Set([
		...activeSlugs.map(({ slug }) => slug),
		...redirectedSlugs.flatMap(({ from, to }) => [from, to]),
	])
}
export const generateUniqueSlug: GenerateUniqueSlug = async (org, existingSlugs) => {
	const slugSet = existingSlugs ?? (await getSlugs())

	const slugCandidates = [slug(org.name), slug(`${org.name} ${org.id.slice(-4)}`)]
	for (const slug of slugCandidates) {
		if (!slugSet.has(slug)) return slug
	}
	throw new Error('Unable to generate unique slug')
}

type GenerateUniqueSlug = (org: { name: string; id: string }, existingSlugs?: Set<string>) => Promise<string>

export const slugUpdate: SlugUpdate = async (org, existingSlugs) => {
	if (slug(org.name) === org.slug) {
		return org.slug
	}
	return await generateUniqueSlug(org, existingSlugs)
}
type SlugUpdate = (
	org: { name: string; id: string; slug: string },
	existingSlugs?: Set<string>
) => Promise<string>
