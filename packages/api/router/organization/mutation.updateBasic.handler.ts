import { generateId, generateUniqueSlug, getAuditedClient, type Prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateBasicSchema } from './mutation.updateBasic.schema'

export const updateBasic = async ({ ctx, input }: TRPCHandlerParams<TUpdateBasicSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)
		const data: Prisma.OrganizationUpdateInput = {}

		if (input.name) {
			const existing = await prisma.organization.findUniqueOrThrow({
				where: { id: input.id },
				select: { slug: true },
			})
			const newSlug = await generateUniqueSlug({ name: input.name, id: input.id })
			data.name = input.name
			data.slug = newSlug
			data.oldSlugs = { create: { from: existing.slug, to: newSlug, id: generateId('slugRedirect') } }
		}
		if (input.description) {
			data.description = { update: { tsKey: { update: { text: input.description } } } }
		}

		const update = await prisma.organization.update({
			where: { id: input.id },
			data,
		})
		return update
	} catch (error) {
		handleError(error)
	}
}
