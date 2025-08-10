import { addSingleKey, updateSingleKey } from '@weareinreach/crowdin/api'
import {
	generateId,
	generateNestedFreeTextUpsert,
	generateUniqueSlug,
	getAuditedClient,
	type Prisma,
} from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateBasicSchema } from './mutation.updateBasic.schema'

// Helper function to generate a simple, non-unique slug for comparison
const simpleSlugify = (name: string) =>
	name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')

const updateBasic = async ({ ctx, input }: TRPCHandlerParams<TUpdateBasicSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)
		const data: Prisma.OrganizationUpdateInput = {}
		const existing = await prisma.organization.findUniqueOrThrow({
			where: { id: input.id },
			select: {
				name: true, // Select the name to compare
				slug: true,
				// Add oldSlugs to the select to get all previous slugs
				oldSlugs: {
					select: { from: true },
				},
				description: { select: { tsKey: { select: { crowdinId: true, key: true } } } },
			},
		})

		// Extract previous slugs for easier checking
		const previousSlugs = existing.oldSlugs.map((s) => s.from)

		// Only generate a new slug if the name has actually changed
		if (input.name && input.name !== existing.name) {
			// Create a temporary slug to check if it's the same as the existing one.
			const newSlugCandidate = simpleSlugify(input.name)

			// Check if the new name's slug is either the current slug or a previous slug for this organization.
			if (newSlugCandidate === existing.slug || previousSlugs.includes(newSlugCandidate)) {
				// If the new name results in a slug that was previously used by this organization,
				// we simply update the name and the slug. No new redirect is created in this specific case.
				data.name = input.name
				data.slug = newSlugCandidate
			} else {
				// If the new name is truly different from all previous slugs,
				// we generate a unique slug and create a redirect.
				const newSlug = await generateUniqueSlug({ name: input.name, id: input.id })
				data.name = input.name
				data.slug = newSlug
				data.oldSlugs = { create: { from: existing.slug, to: newSlug, id: generateId('slugRedirect') } }
			}
		}

		if (input.description) {
			const upsertDescription = generateNestedFreeTextUpsert({
				orgId: input.id,
				type: 'orgDesc',
				text: input.description,
			})
			if (existing.description?.tsKey.crowdinId) {
				console.log('update crowdin', {
					key: existing.description.tsKey.key,
					isDatabaseString: true,
					updatedString: upsertDescription.upsert.update.tsKey.update.text,
				})
				await updateSingleKey({
					key: existing.description.tsKey.key,
					isDatabaseString: true,
					updatedString: upsertDescription.upsert.update.tsKey.update.text,
				})
			} else {
				console.log('add crowdin', {
					isDatabaseString: true,
					key: upsertDescription.upsert.create.tsKey.create.key,
					text: upsertDescription.upsert.create.tsKey.create.text,
				})
				const { id: crowdinId } = await addSingleKey({
					isDatabaseString: true,
					key: upsertDescription.upsert.create.tsKey.create.key,
					text: upsertDescription.upsert.create.tsKey.create.text,
				})
				upsertDescription.upsert.create.tsKey.create.crowdinId = crowdinId
			}
			data.description = upsertDescription
		}
		const update = await prisma.organization.update({
			where: { id: input.id },
			select: {
				name: true,
				slug: true,
			},
			data,
		})
		return update
	} catch (error) {
		return handleError(error)
	}
}
export default updateBasic
