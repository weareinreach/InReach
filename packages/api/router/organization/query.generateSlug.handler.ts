import slugify from 'slugify'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGenerateSlugSchema } from './query.generateSlug.schema'

const uniqueSlug = async (name: string, inc?: number): Promise<string> => {
	try {
		const check = async (slug: string) => {
			const existing = await prisma.organization.findUnique({
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
		else return await uniqueSlug(name, (inc ?? 0) + 1)
	} catch (error) {
		console.error(error)
		throw error
	}
}

export const generateSlug = async ({ input }: TRPCHandlerParams<TGenerateSlugSchema>) => {
	const slug = await uniqueSlug(input)
	return slug
}
