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

const updateBasic = async ({ ctx, input }: TRPCHandlerParams<TUpdateBasicSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)
		const data: Prisma.OrganizationUpdateInput = {}
		const existing = await prisma.organization.findUniqueOrThrow({
			where: { id: input.id },
			select: { slug: true, description: { select: { tsKey: { select: { crowdinId: true, key: true } } } } },
		})

		if (input.name) {
			const newSlug = await generateUniqueSlug({ name: input.name, id: input.id })
			data.name = input.name
			data.slug = newSlug
			data.oldSlugs = { create: { from: existing.slug, to: newSlug, id: generateId('slugRedirect') } }
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
