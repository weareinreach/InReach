import { addSingleKeyFromNestedFreetextCreate, buildContextUrl } from '@weareinreach/crowdin/api'
import { generateNestedFreeText, getAuditedClient } from '@weareinreach/db'
import { connectOneId, connectOneIdRequired } from '~api/schemas/nestedOps'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAttachAttributeSchema } from './mutation.attachAttribute.schema'

const attachAttribute = async ({ ctx, input }: TRPCHandlerParams<TAttachAttributeSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { locationId, organizationId, serviceId } = input

	const { id: orgId, slug: orgSlug } = organizationId
		? await prisma.organization.findUniqueOrThrow({
				where: { id: organizationId },
				select: { id: true, slug: true },
			})
		: await prisma.organization.findFirstOrThrow({
				where: {
					OR: [{ locations: { some: { id: locationId } } }, { services: { some: { id: serviceId } } }],
				},
				select: {
					id: true,
					slug: true,
				},
			})

	const freeText = input.text
		? generateNestedFreeText({ orgId, text: input.text, type: 'attSupp', itemId: input.id })
		: undefined

	// Crowdin sync (a network call to a third party) must not happen inside the DB transaction below -
	// Prisma's interactive transactions have a ~5s timeout, and holding it open across an external API
	// call risks "Transaction already closed" once Crowdin is slow to respond.
	if (freeText) {
		const { id: crowdinId } = await addSingleKeyFromNestedFreetextCreate(
			freeText,
			buildContextUrl(orgSlug, locationId)
		)
		freeText.create.tsKey.create.crowdinId = crowdinId
	}

	const batchedUpdate = await prisma.$transaction(async (tx) => {
		const result = await tx.attributeSupplement.create({
			data: {
				id: input.id,
				attribute: connectOneIdRequired(input.attributeId),
				organization: connectOneId(organizationId),
				country: connectOneId(input.countryId),
				govDist: connectOneId(input.govDistId),
				language: connectOneId(input.languageId),
				service: connectOneId(serviceId),
				location: connectOneId(locationId),
				boolean: input.boolean,
				data: input.data,
				text: freeText,
			},
			select: {
				id: true,
			},
		})
		return result
	})
	return batchedUpdate
}
export default attachAttribute
