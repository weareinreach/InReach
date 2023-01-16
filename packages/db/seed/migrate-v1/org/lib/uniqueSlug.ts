/* eslint-disable @typescript-eslint/restrict-template-expressions */
import slugify from 'slugify'

import { prisma } from '~/index'
import { slugSet } from '~/seed/migrate-v1/org/generator'

/**
 * It takes a name, city, and state, and returns a unique slug based on those values
 *
 * @param {string} name - The name of the organization
 * @param {string} [city] - The city of the organization
 * @param {string} [state] - The state the organization is located in
 * @returns A slug based on name and city/state, if needed.
 */
export const uniqueSlug = async (name: string, city?: string, state?: string) => {
	/**
	 * It checks if an organization with the given slug exists in the database
	 *
	 * @param slug - The slug to check
	 * @returns A boolean value
	 */
	const check = async (slug: string) => {
		const existing = await prisma.organization.findUnique({
			where: {
				slug,
			},
			select: {
				slug: true,
			},
		})
		return existing?.slug || slugSet.has(slug) ? false : true
	}
	const slugs = [
		slugify(name, { lower: true }),
		slugify(`${name} ${state}`, { lower: true }),
		slugify(`${name} ${city} ${state}`, { lower: true }),
	]
	for (const slug of slugs) {
		if (await check(slug)) return slug
	}
	throw new Error('Unable to generate unique slug')
}
